---
name: review-feedback-loop
description: "Run a slow quality loop for Codex work: turn the user objective into a testable goal, plan, use independent review when available, triage findings by severity, implement scoped fixes, self-review, request diff review, verify, and repeat until critical/high issues are resolved. Use for collaborative goal-plan-implement-review iteration, long-running work, assignment work, refactors, migrations, bug fixes, frontend changes, deployment fixes, and requests like goal loop, review loop, green until done, slow vibe coding, 목표부터, 리뷰 루프, 클로드랑 같이, 구현 후 리뷰 반영, or green 될 때까지."
---

# Review Feedback Loop

## Overview

Use this when the user wants Codex to work with deliberate checkpoints instead of a single pass. Codex remains the orchestrator and final implementer; reviewers provide signals, not authority.

## Roles

### Codex

- Analyze current code, docs, requirements, and dirty worktree.
- Turn the request into a testable goal.
- Create and revise the implementation plan.
- Triage external feedback as accepted, deferred, or rejected.
- Apply scoped code changes.
- Run verification and summarize remaining risk.

### Independent Reviewers

- Review goals, plans, or diffs for bugs, regressions, hidden requirements, edge cases, UX/accessibility issues, and over-engineering.
- Classify findings as `critical`, `high`, `medium`, or `low`.
- Suggest concrete changes without editing the same files concurrently.

### Human/User

- Own product direction, priority, and final risk acceptance.
- Decide ambiguous trade-offs when correctness, scope, and complexity conflict.

## Severity

- `critical`: security issue, data loss, crash, core required flow broken, or submission/release blocker.
- `high`: likely real user bug, serious regression, accessibility blocker, or requirement reviewers will probably test.
- `medium`: valid improvement or edge case with moderate likelihood or limited impact.
- `low`: style, naming, comments, subjective polish, or speculative issue.

## Triage Rules

- **Accept** findings that are reproducible or strongly plausible, in scope, and improve correctness without disproportionate complexity.
- **Defer** findings that are real but outside this slice, low likelihood, or better handled in a follow-up.
- **Reject** findings that are impossible in the current app, conflict with requirements, duplicate existing behavior, or add more complexity than value.
- If multiple reviewers independently flag the same `critical` or `high` issue, treat confidence as higher, but still verify before changing code.

## Required Loop

1. **Context scan**
   - Read relevant files and docs first.
   - Check `git status --short` when available.
   - Confirm the newest user request and priority.

2. **Goal loop**
   - Convert the raw request into a goal with user outcome, scope, non-goals, constraints, success criteria, and assumptions.
   - For ambiguous or high-risk work, request a goal review from an independent reviewer when available.
   - Do not plan implementation until the final goal is clear.

3. **Plan**
   - Write a short, concrete plan based on the final goal.
   - Include affected files, boundaries, risks, and verification commands.
   - Use project-specific rules from local instructions, repo docs, and existing conventions.

4. **Plan review**
   - Ask an independent reviewer to review the plan when available and useful.
   - Request severity labels, concrete evidence, and whether each issue must be fixed now.
   - Triage every finding before editing code.

5. **Implementation**
   - Make scoped changes.
   - Preserve unrelated user changes.
   - Prefer small changes that can be verified independently.
   - Use existing project patterns over new abstractions.

6. **Self-review**
   - Review the diff before external review.
   - Check stale imports, extra state, missing cleanup, accidental scope creep, unverified assumptions, and missing manual QA paths.

7. **Diff review**
   - Ask an independent reviewer to review the actual diff when available.
   - Focus on bugs, regressions, requirements, accessibility, responsive behavior, state boundaries, API/cache boundaries, and release/submission quality.

8. **Feedback decision**
   - Apply accepted `critical` and `high` findings first.
   - Apply `medium` only when the fix is small, clear, and does not distract from the slice.
   - Usually skip `low` unless it reduces reviewer confusion or user-facing polish risk.
   - If changes are material or shared, review again.

9. **Verification**
   - Run the relevant project commands.
   - Prefer the repo's own scripts over generic guesses.
   - For frontend changes, add browser or screenshot checks when the UI surface is affected.

10. **Closeout**
    - State what changed, which feedback was accepted/deferred/rejected, verification results, and remaining risk.
    - Do not claim external review occurred unless it did.

## Reviewer Prompt

```text
Review this goal, plan, or diff as an independent reviewer.
Prioritize bugs, regressions, missing requirements, edge cases, accessibility, state boundaries, and over-engineering.
Return findings in severity order: critical, high, medium, low.
For each finding, include evidence or a reproduction path, likelihood, and whether it should be fixed in this slice.
Do not implement.
```

## Stop Rule

Stop when accepted `critical` and `high` findings are resolved, deferred risks are explicit, and verification is green or the user accepts the remaining risk.
