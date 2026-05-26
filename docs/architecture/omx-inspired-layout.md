# OMX-Inspired Layout

Codex Loop intentionally copies the maintainable parts of OMX's plugin shape, not its runtime.

## Adopted

- Repo-local marketplace at `.agents/plugins/marketplace.json`.
- Installable plugin bundle under `plugins/codex-loop`.
- Root `skills/` as the canonical skill authoring surface.
- Generated-or-verified plugin skill mirror.
- Node scripts for sync and verification.
- CI that checks drift before merge.

## Deferred

- Runtime hooks.
- MCP and app manifests.
- HUD, team orchestration, tmux management, and durable runtime state.
- Native agent/prompt generation.

Those surfaces should appear only when Codex Loop grows beyond a skill bundle into an actual runtime layer.
