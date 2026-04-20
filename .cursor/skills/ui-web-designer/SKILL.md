---
name: ui-web-designer
description: Designs and implements production-ready UI for this webxdc Svelte project using shadcn-svelte patterns, accessibility, and responsive layouts. Use when the user asks for UI redesign, new screens, UX improvements, component styling, visual polish, or frontend implementation details.
---

# UI Web Designer

Use this skill when tasks involve product UI/UX direction or frontend implementation.

## Core behavior

1. Start from user goals, not demo visuals.
2. Treat `src/routes/example_+page.svelte` as behavior reference only.
3. Match layout, hierarchy, and interaction patterns to the requested product.
4. Prefer reusable components in `src/lib/components/ui/*` and shared logic in `src/lib/*`.
5. Keep webxdc compatibility and static build constraints intact.

## Design workflow

1. Define the target:
   - Primary user action
   - Key information hierarchy
   - Device constraints (small mobile webviews first)
2. Propose structure before styling:
   - Page sections
   - Navigation/entry points
   - Empty/loading/error states
3. Apply visual system:
   - Consistent spacing scale
   - Clear typography levels
   - Limited color roles (background, foreground, accent, feedback)
4. Implement with reusable pieces:
   - Compose from existing shadcn-svelte components first
   - Create new UI components only when reuse is not enough
5. Verify usability:
   - Keyboard reachable interactions
   - Accessible labels and focus visibility
   - Responsive behavior at narrow widths

## Implementation defaults for this repo

- Use Svelte 5 patterns already used by the project (`$state`, `$props`, `$derived`).
- Prefer `Button`, `Input`, and existing UI components over raw controls when appropriate.
- Keep copy concise and task-oriented.
- Avoid demo-specific text/content unless the user requests it.
- If adding components, follow:
  - `src/lib/components/ui/<name>/<name>.svelte`
  - `src/lib/components/ui/<name>/index.ts`

## UI quality checklist

- [ ] The screen reflects the user's requested product goals.
- [ ] The design is not a visual clone of the example app.
- [ ] Components are reusable and consistent with existing UI primitives.
- [ ] Primary actions are visually clear and easy to reach.
- [ ] Empty/loading/error states are handled.
- [ ] Layout works in narrow mobile webview sizes.
- [ ] Changes preserve webxdc compatibility constraints.

