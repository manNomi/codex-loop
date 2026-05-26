#!/usr/bin/env node
import { existsSync } from "node:fs";
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const PLUGIN_NAME = "codex-loop";
const INSTALLABLE_STATUSES = new Set(["active", "internal"]);
const EXCLUDED_STATUSES = new Set(["alias", "merged", "deprecated"]);

function repoRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function stringifyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function normalizeTextBuffer(buffer) {
  return buffer.toString("utf8").replace(/\r\n/g, "\n");
}

async function listFiles(root, base = root) {
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(path, base));
    } else if (entry.isFile()) {
      files.push(relative(base, path));
    }
  }

  return files.sort();
}

async function assertSameFile(leftPath, rightPath) {
  const [left, right] = await Promise.all([
    readFile(leftPath),
    readFile(rightPath)
  ]);
  if (normalizeTextBuffer(left) !== normalizeTextBuffer(right)) {
    throw new Error(`plugin_skill_mirror_out_of_sync:file=${leftPath}`);
  }
}

async function assertSameDirectory(leftDir, rightDir) {
  const [leftFiles, rightFiles] = await Promise.all([
    listFiles(leftDir),
    listFiles(rightDir)
  ]);
  if (JSON.stringify(leftFiles) !== JSON.stringify(rightFiles)) {
    throw new Error([
      "plugin_skill_mirror_out_of_sync",
      `source=${leftDir}`,
      `mirror=${rightDir}`,
      `expected=${JSON.stringify(leftFiles)}`,
      `actual=${JSON.stringify(rightFiles)}`
    ].join("\n"));
  }

  await Promise.all(leftFiles.map((file) => (
    assertSameFile(join(leftDir, file), join(rightDir, file))
  )));
}

function getPluginSkillNames(catalog) {
  return catalog.skills
    .filter((skill) => skill.plugin !== false)
    .filter((skill) => INSTALLABLE_STATUSES.has(skill.status))
    .map((skill) => skill.name)
    .sort();
}

async function assertCatalogConsistency(root, catalog, pluginSkillNames) {
  const rootSkillsDir = join(root, "skills");
  const entries = await readdir(rootSkillsDir, { withFileTypes: true });
  const rootSkillDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const catalogByName = new Map(catalog.skills.map((skill) => [skill.name, skill]));
  const pluginSkillSet = new Set(pluginSkillNames);

  for (const skillName of pluginSkillNames) {
    const skillPath = join(rootSkillsDir, skillName, "SKILL.md");
    if (!existsSync(skillPath)) {
      throw new Error(`canonical_skill_missing:skills/${skillName}/SKILL.md`);
    }
  }

  const uncataloged = rootSkillDirs.filter((skillName) => !catalogByName.has(skillName));
  if (uncataloged.length > 0) {
    throw new Error(`canonical_skill_catalog_out_of_sync:uncataloged=${JSON.stringify(uncataloged)}`);
  }

  const invalidExcluded = rootSkillDirs.filter((skillName) => {
    if (pluginSkillSet.has(skillName)) return false;
    const status = catalogByName.get(skillName)?.status;
    return !EXCLUDED_STATUSES.has(status);
  });
  if (invalidExcluded.length > 0) {
    throw new Error(`canonical_skill_catalog_out_of_sync:not_installable=${JSON.stringify(invalidExcluded)}`);
  }
}

async function updatePluginManifest(root, check) {
  const packageJson = await readJson(join(root, "package.json"));
  const manifestPath = join(root, "plugins", PLUGIN_NAME, ".codex-plugin", "plugin.json");
  const manifest = await readJson(manifestPath);
  const expected = {
    ...manifest,
    name: PLUGIN_NAME,
    version: packageJson.version,
    skills: "./skills/"
  };
  const actualJson = stringifyJson(manifest);
  const expectedJson = stringifyJson(expected);

  if (actualJson !== expectedJson) {
    if (check) {
      throw new Error([
        "plugin_bundle_metadata_out_of_sync",
        "kind=plugin-manifest",
        `expected=${expectedJson.trim()}`,
        `actual=${actualJson.trim()}`
      ].join("\n"));
    }
    await writeFile(manifestPath, expectedJson);
    return true;
  }
  return false;
}

async function syncSkills(root, skillNames, check) {
  const sourceSkillsDir = join(root, "skills");
  const mirrorSkillsDir = join(root, "plugins", PLUGIN_NAME, "skills");
  const changed = { value: false };

  if (check) {
    const mirrorEntries = existsSync(mirrorSkillsDir)
      ? await readdir(mirrorSkillsDir, { withFileTypes: true })
      : [];
    const mirroredSkillNames = mirrorEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    if (JSON.stringify(mirroredSkillNames) !== JSON.stringify(skillNames)) {
      throw new Error([
        "plugin_skill_mirror_out_of_sync",
        `expected_skills=${JSON.stringify(skillNames)}`,
        `actual_skills=${JSON.stringify(mirroredSkillNames)}`
      ].join("\n"));
    }
    await Promise.all(skillNames.map((skillName) => (
      assertSameDirectory(
        join(sourceSkillsDir, skillName),
        join(mirrorSkillsDir, skillName)
      )
    )));
    return false;
  }

  await rm(mirrorSkillsDir, { recursive: true, force: true });
  await mkdir(mirrorSkillsDir, { recursive: true });

  for (const skillName of skillNames) {
    const source = join(sourceSkillsDir, skillName);
    const destination = join(mirrorSkillsDir, skillName);
    await cp(source, destination, { recursive: true });
    changed.value = true;
  }

  return changed.value;
}

export async function syncPluginBundle(options = {}) {
  const root = resolve(options.root ?? repoRoot());
  const check = Boolean(options.check);
  const catalog = await readJson(join(root, "templates", "catalog-manifest.json"));
  const pluginSkillNames = getPluginSkillNames(catalog);

  await assertCatalogConsistency(root, catalog, pluginSkillNames);

  const metadataChanged = await updatePluginManifest(root, check);
  const skillsChanged = await syncSkills(root, pluginSkillNames, check);

  return {
    checked: check,
    changed: metadataChanged || skillsChanged,
    mirroredSkillNames: pluginSkillNames
  };
}

function isDirectCliInvocation() {
  return process.argv[1]
    ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
    : false;
}

if (isDirectCliInvocation()) {
  const check = process.argv.includes("--check");
  syncPluginBundle({ check })
    .then((result) => {
      const mode = check ? "verified" : "synced";
      console.log(`${mode}: ${result.mirroredSkillNames.join(", ")}`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
