# Cloud Agent Instructions

This repository is a webxdc template and must follow webxdc host compatibility rules.

Required reading before making changes:

- `README.md` section: **Agent Required Reading: webxdc compatibility**
- <https://github.com/webxdc/website/blob/main/src-docs/faq/compat.md>
- `docs/README.md`
- `docs/SHADCN_SVELTE.md`

## Non-negotiable compatibility constraints

- Use `localStorage`; do not use `document.cookie`.
- Use `visibilitychange`; do not rely on `unload`, `beforeunload`, `pagehide`.
- Treat `manifest.toml` as title source; do not rely on `document.title`.
- Prefer `sendToChat()` for exports/downloads.
- Avoid permission-gated APIs unless explicitly supported by target hosts.
- Avoid `window.open()`, `alert()`, `prompt()`, `confirm()`.
- Keep JS/web APIs compatible with older webviews; transpile if needed.

## Svelte and app architecture expectations

- Follow Svelte 5 conventions used in repo (`$state`, `$props`, `$derived`).
- Prefer reusable logic in `src/lib/*`; avoid monolithic page-only logic for new features.
- Preserve static webxdc build behavior (SvelteKit static adapter + relative assets).

## shadcn-svelte expectations

- This template is based on shadcn-svelte:
  - https://shadcn-svelte.com
- Add components with:
  - `bun x shadcn-svelte@latest add <component>`
  - example: `bun x shadcn-svelte@latest add card`
- Component catalog:
  - https://shadcn-svelte.com/docs/components
- Use reusable UI components under `src/lib/components/ui/*`.
- Prefer existing `Button` and `Input` components over raw HTML controls when appropriate.
- Treat the example app as an implementation reference, not a fixed visual design to clone.
- Build UI to match the user's requested product goals and brand/density/content needs.
- Do not copy demo-specific layout, spacing, color, copy, or component composition unless explicitly requested.
- For new components, create:
  - `src/lib/components/ui/<name>/<name>.svelte`
  - `src/lib/components/ui/<name>/index.ts`
- Update `docs/SHADCN_SVELTE.md` whenever UI component inventory/usage changes.

## Example/demo requirements

Keep template examples functional and documented:

- shared-state ops with Lamport metadata
- notify/reply-by-address mention flow
- `sendToChat()` text and file export
- `importFiles()` usage
- realtime native + emulation mode
- `@webxdc/realtime` helper example
- Preserve example behavior while allowing project-specific UI presentation.

## Build and verification requirements

Run before finalizing:

- `bun run check`
- `bun run build`

For release/packaging changes, also run:

- `bun run package:release`

## Release/versioning requirements

- Preserve semantic-release automation (`.releaserc.json`, CI workflow).
- Preserve versioned artifact naming:
  - `webxdc-svelte-shadcn-template_vX-Y-Z.xdc`
  - `webxdc-svelte-shadcn-template_vX-Y-Z.zip`
- Preserve `.xdc` packaging rule: exclude `webxdc.js`.

## Conventional commit policy

Commits must follow conventional commit format (semantic-release dependency):

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `chore: ...`

Use `BREAKING CHANGE:` footer for major-version changes.

## Documentation maintenance

If behavior changes, update:

- `README.md`
- `docs/README.md`
- `docs/SHADCN_SVELTE.md` (if UI/component-related)
