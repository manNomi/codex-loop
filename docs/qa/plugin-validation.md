# Plugin Validation

Run the full local check before committing:

```bash
npm run validate
```

This verifies:

- Root skills match the plugin mirror.
- Plugin manifest metadata follows package version and plugin path rules.
- Marketplace JSON points at `./plugins/codex-loop`.
- Skill frontmatter has matching names and non-placeholder descriptions.
- Each skill has UI metadata under `agents/openai.yaml`.

For a read-only drift check, run:

```bash
npm run verify:plugin-bundle
```
