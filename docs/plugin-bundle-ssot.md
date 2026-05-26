# Plugin Bundle SSOT Contract

Codex Loop follows an OMX-inspired plugin bundle layout.

## Canonical Roots

- **Root skills:** `skills/<name>/` is the canonical authoring surface.
- **Plugin mirror:** `plugins/codex-loop/skills/<name>/` is generated from root skills.
- **Skill membership:** `templates/catalog-manifest.json` controls which skills are mirrored into the plugin.
- **Plugin version:** `package.json` is canonical for `plugins/codex-loop/.codex-plugin/plugin.json`.
- **Marketplace entry:** `.agents/plugins/marketplace.json` points to `./plugins/codex-loop`.

## Commands

```bash
npm run sync:plugin
npm run verify:plugin-bundle
npm run validate
```

`sync:plugin` mutates the plugin mirror. `verify:plugin-bundle` is non-mutating and fails when the checked-in mirror drifts from root skills or package metadata.

## Adding Or Changing A Skill

1. Edit or add the canonical skill under `skills/<name>/`.
2. Add or update the skill entry in `templates/catalog-manifest.json`.
3. Run `npm run sync:plugin`.
4. Run `npm run validate`.

Do not edit `plugins/codex-loop/skills/` directly unless repairing generated output before a sync.
