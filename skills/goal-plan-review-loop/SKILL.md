---
name: goal-plan-review-loop
description: "Create a reviewed implementation plan before editing code. Use when the user asks to start from a goal, get a plan to GREEN, review a plan with Claude or another independent reviewer, or prepare a scoped implementation plan for a feature, refactor, migration, UI change, deployment, coding assignment, or long-running Codex task. Trigger for Korean requests like 목표부터, 계획 검수, 구현 전 계획, GREEN까지, or 클로드에게 계획 리뷰."
---

# Goal Plan Review Loop

## Overview

Use this before implementation when the work is meaningful enough that a bad plan would create churn. The output is a concrete, reviewed plan with a clear stop condition; code edits come later.

## Workflow

1. **Protect current work**
   - Run `git status --short` when inside a git repository.
   - If unrelated dirty files exist, avoid staging or editing them.
   - If this workspace is not a git repository, state that and continue.

2. **Gather facts**
   - Read the user request, existing plan or issue, relevant docs, and source files.
   - Prefer exact file references and observed behavior over guesses.
   - For API or integration plans, verify real responses or contracts when practical.

3. **Draft the goal**
   - Convert the request into a testable goal.
   - Include user outcome, scope, non-goals, constraints, success criteria, and open assumptions.
   - Ask the user only when an assumption would materially change the plan or risk.

4. **Draft the implementation plan**
   - Keep the unit small enough for one reviewable change.
   - Include: Summary, Scope, Non-goals, Current State, Ownership Boundaries, Files To Touch, Implementation Order, Risks, Verification.
   - Add frontend-only sections such as Server/Client Boundary, Component Tree, accessibility, and responsive checks only when relevant.

5. **Codex self-review**
   - Review requirement coverage, feature creep, ownership boundaries, testability, dirty-worktree risk, and missing states.
   - Patch the plan before external review.

6. **Independent plan review**
   - If Claude, a subagent, Cursor Bugbot, or another reviewer is available and appropriate, ask for blocking or important findings only.
   - Ask reviewers to return `GREEN` only when the plan is implementation-ready.
   - Do not claim an independent review happened unless it actually happened.

7. **Consolidate**
   - Triage every finding as accepted, deferred, or rejected.
   - Revise the plan until no accepted blocking or important plan issues remain.
   - Record unresolved assumptions and the verification commands or artifacts needed after implementation.

## Green Criteria

- The goal is testable and scoped.
- Non-goals prevent scope creep.
- Facts are concrete and source-backed.
- Files to touch match the implementation order.
- Ownership boundaries are explicit.
- Error, loading, empty, missing, and permission states are mapped when relevant.
- Verification includes commands, manual scenarios, or artifacts that prove completion.
- External review, if used, returns `GREEN` or all important findings are triaged.

## Reviewer Prompt

```text
Review this implementation plan. Return GREEN only if it is implementation-ready with no blocking or important issues.
Otherwise return only blocking or important findings with concrete edits.
Focus on requirement coverage, scope, architecture boundaries, state ownership, testability, and feature creep.
Do not implement.
```
