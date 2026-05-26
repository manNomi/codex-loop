# Codex Loop

Codex Loop is an OMX-inspired local Codex plugin bundle for deliberate work loops:

- `goal-plan-review-loop`: turn a rough objective into a reviewed implementation plan before editing code.
- `review-feedback-loop`: plan, implement, triage review feedback, verify, and repeat until high-risk issues are resolved.
- `ui-polish-loop`: make focused frontend UI changes and verify them with browser-backed checks.

## Layout

```text
.agents/plugins/marketplace.json
skills/
templates/catalog-manifest.json
plugins/codex-loop/
  .codex-plugin/plugin.json
  skills/
```

Root `skills/` is the canonical authoring surface. `plugins/codex-loop/skills/` is a generated-or-verified mirror used by the installable plugin bundle.

## Commands

```bash
npm run sync:plugin
npm run verify:plugin-bundle
npm run validate
```

The marketplace file points to `./plugins/codex-loop`, following the same local plugin catalog shape used by larger Codex plugin repositories.
