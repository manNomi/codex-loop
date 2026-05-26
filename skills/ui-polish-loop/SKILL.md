---
name: ui-polish-loop
description: "Iterate frontend UI changes with focused edits and browser-backed verification. Use when the user asks to polish screens, match a screenshot or Figma design, fix spacing/alignment/color/copy/responsive behavior, improve loading/empty/error states, or make small visual changes while preserving existing components, design tokens, and data flow. Trigger for Korean UI requests like 화면 다듬어줘, UI 수정, 스크린샷처럼 맞춰줘, 간격 조정, 모바일 깨짐, or 예쁘게 정리."
---

# UI Polish Loop

## Overview

Use this for visual frontend work where the quality depends on seeing the result, not only reading the diff. Keep the loop small: one visual intent, one focused edit, one verification pass.

## Workflow

1. **Understand the visual target**
   - Read the user note, screenshot, Figma context, existing design, or current UI.
   - Identify the exact screen, state, breakpoint, and interaction to polish.
   - Translate vague requests into observable changes such as spacing, hierarchy, contrast, alignment, overflow, or state behavior.

2. **Inspect existing UI patterns**
   - Find the owning page/component and nearby reusable components.
   - Reuse existing design tokens, icons, spacing primitives, layout components, and state patterns.
   - Avoid creating a new visual system for a small polish request.

3. **Plan the smallest useful edit**
   - Limit each loop to one coherent visual change or tightly related group.
   - Preserve data flow, API behavior, routing, and component boundaries unless the visual fix requires a small structural adjustment.
   - Note any assumption that affects layout or product behavior.

4. **Implement**
   - Make scoped edits.
   - Prefer stable layout constraints: grid tracks, flex rules, aspect ratios, min/max sizes, and fixed control dimensions where needed.
   - Ensure text cannot overlap or overflow awkwardly on narrow and wide viewports.

5. **Verify in browser**
   - Start the local dev server when the app requires it.
   - Use Browser, Playwright, or the repo's visual test tooling when available.
   - Check at least one desktop and one mobile viewport for responsive surfaces.
   - Exercise relevant states: loading, empty, error, disabled, selected, hover/focus, long text, and narrow containers when applicable.

6. **Review the screenshot or rendered page**
   - Look for overlap, clipping, layout shift, broken contrast, unreadable text, wrong hierarchy, and inconsistent spacing.
   - Compare against the screenshot/Figma/reference when provided.
   - If the result misses the target, apply another small edit and verify again.

7. **Closeout**
   - Summarize the visual changes and verification performed.
   - Mention any viewport, state, or browser check that could not be run.

## Quality Bar

- Existing components and tokens are preserved where practical.
- The edited surface works on mobile and desktop.
- Text fits within controls and containers.
- Interactive states remain usable and accessible.
- No visible overlap, accidental scroll traps, or clipped important content.
- Visual changes match the requested intent without unrelated redesign.

## Browser Check Template

```text
Open the changed route in the browser.
Capture desktop and mobile viewports.
Check layout, text fitting, interaction states, and console errors.
Compare against the provided reference if one exists.
Iterate until the changed surface is visually coherent.
```
