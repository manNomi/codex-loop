# Codex Loop

Codex Loop is a local Codex plugin bundle for deliberate work loops:

- `goal-plan-review-loop`: turn a rough objective into a reviewed implementation plan before editing code.
- `review-feedback-loop`: plan, implement, triage review feedback, verify, and repeat until high-risk issues are resolved.
- `ui-polish-loop`: make focused frontend UI changes and verify them with browser-backed checks.

## Layout

```text
.agents/plugins/marketplace.json
plugins/codex-loop/
  .codex-plugin/plugin.json
  skills/
```

The marketplace file points to `./plugins/codex-loop`, following the same local plugin catalog shape used by larger Codex plugin repositories.
