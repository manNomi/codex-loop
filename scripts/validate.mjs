#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { syncPluginBundle } from "./sync-plugin.mjs";

const ROOT = resolve(process.cwd());
const PLUGIN_NAME = "codex-loop";
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function unquoteYamlScalar(value) {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function parseFrontmatter(markdown, path) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  assert(match, `skill_frontmatter_missing:${path}`);
  const fields = new Map();
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (field) fields.set(field[1], unquoteYamlScalar(field[2]));
  }
  return fields;
}

async function validatePluginManifest() {
  const pluginPath = join(ROOT, "plugins", PLUGIN_NAME, ".codex-plugin", "plugin.json");
  const manifest = await readJson(pluginPath);
  assert(manifest.name === PLUGIN_NAME, "plugin_manifest_invalid:name");
  assert(SEMVER_PATTERN.test(manifest.version), "plugin_manifest_invalid:version");
  assert(typeof manifest.description === "string" && manifest.description.length > 20, "plugin_manifest_invalid:description");
  assert(manifest.author?.name, "plugin_manifest_invalid:author.name");
  assert(manifest.skills === "./skills/", "plugin_manifest_invalid:skills");
  assert(manifest.interface?.displayName, "plugin_manifest_invalid:interface.displayName");
  assert(manifest.interface?.shortDescription, "plugin_manifest_invalid:interface.shortDescription");
  assert(manifest.interface?.longDescription, "plugin_manifest_invalid:interface.longDescription");
  assert(manifest.interface?.developerName, "plugin_manifest_invalid:interface.developerName");
  assert(manifest.interface?.category, "plugin_manifest_invalid:interface.category");
  assert(!JSON.stringify(manifest).includes("[TODO"), "plugin_manifest_invalid:todo");
}

async function validateMarketplace() {
  const marketplacePath = join(ROOT, ".agents", "plugins", "marketplace.json");
  const marketplace = await readJson(marketplacePath);
  assert(marketplace.name === "codex-loop-local", "marketplace_invalid:name");
  assert(Array.isArray(marketplace.plugins), "marketplace_invalid:plugins");
  const entry = marketplace.plugins.find((plugin) => plugin.name === PLUGIN_NAME);
  assert(entry, "marketplace_invalid:missing_codex_loop");
  assert(entry.source?.source === "local", "marketplace_invalid:source");
  assert(entry.source?.path === "./plugins/codex-loop", "marketplace_invalid:path");
  assert(entry.policy?.installation === "AVAILABLE", "marketplace_invalid:installation");
  assert(entry.policy?.authentication === "ON_INSTALL", "marketplace_invalid:authentication");
}

async function validateCatalogAndSkills() {
  const catalog = await readJson(join(ROOT, "templates", "catalog-manifest.json"));
  assert(Array.isArray(catalog.skills), "catalog_invalid:skills");
  const names = new Set();

  for (const skill of catalog.skills) {
    assert(NAME_PATTERN.test(skill.name), `catalog_invalid:name:${skill.name}`);
    assert(!names.has(skill.name), `catalog_invalid:duplicate:${skill.name}`);
    names.add(skill.name);
    assert(typeof skill.status === "string", `catalog_invalid:status:${skill.name}`);
  }

  const skillDirs = await readdir(join(ROOT, "skills"), { withFileTypes: true });
  for (const entry of skillDirs.filter((entry) => entry.isDirectory())) {
    const skillName = entry.name;
    assert(names.has(skillName), `catalog_invalid:uncataloged_skill:${skillName}`);
    const skillMdPath = join(ROOT, "skills", skillName, "SKILL.md");
    const markdown = await readFile(skillMdPath, "utf8");
    const frontmatter = parseFrontmatter(markdown, skillMdPath);
    assert(frontmatter.get("name") === skillName, `skill_invalid:name:${skillName}`);
    assert(frontmatter.get("description") && !frontmatter.get("description").includes("TODO"), `skill_invalid:description:${skillName}`);
    assert(!markdown.includes("[TODO"), `skill_invalid:todo:${skillName}`);

    const openaiYamlPath = join(ROOT, "skills", skillName, "agents", "openai.yaml");
    assert(existsSync(openaiYamlPath), `skill_invalid:missing_openai_yaml:${skillName}`);
    const openaiYaml = await readFile(openaiYamlPath, "utf8");
    assert(openaiYaml.includes(`$${skillName}`), `skill_invalid:default_prompt_missing_skill_name:${skillName}`);
  }
}

try {
  await syncPluginBundle({ check: true });
  await validatePluginManifest();
  await validateMarketplace();
  await validateCatalogAndSkills();
  console.log("validation-ok");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
