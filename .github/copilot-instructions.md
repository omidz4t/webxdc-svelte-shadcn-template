# Copilot instructions for this repository

This is a **webxdc + SvelteKit + shadcn-svelte template** with CI/release automation.

## Required reading first

- `README.md`
- `docs/README.md`
- `docs/SHADCN_SVELTE.md`
- `README.md` section: **Agent Required Reading: webxdc compatibility**
- webxdc compatibility source: <https://github.com/webxdc/website/blob/main/src-docs/faq/compat.md>

## Webxdc compatibility (must follow)

- Never use `document.cookie`; use `localStorage`.
- Never depend on `unload`, `beforeunload`, `pagehide`; use `visibilitychange`.
- Never depend on `<title>`/`document.title`; use `manifest.toml` `name`.
- Avoid external links as core flow (`https://...`) from app UI.
- Use `sendToChat()` for export/download behavior.
- Avoid permission-gated APIs unless explicitly validated on target hosts.
- Avoid `window.open()`, `alert()`, `prompt()`, `confirm()`.
- Consider older webviews; do not assume latest JS APIs/syntax without compatibility checks/transpilation.

## Svelte/SvelteKit rules

- Prefer idiomatic Svelte 5 patterns used in this repo (`$state`, `$props`, `$derived`, snippets).
- Keep logic reusable in `src/lib/*` when possible.
- Keep route demo behavior in `src/routes/+page.svelte` functional; do not remove examples unless asked.
- Preserve static webxdc output assumptions (`adapter-static`, relative paths, `.xdc` packaging behavior).

## shadcn-svelte/UI rules

- This project uses shadcn-svelte components and patterns:
  - https://shadcn-svelte.com
- Components can be scaffolded with:
  - `bun x shadcn-svelte@latest add <component>`
  - example: `bun x shadcn-svelte@latest add card`
- Component catalog reference:
  - https://shadcn-svelte.com/docs/components
- Prefer reusable UI components under `src/lib/components/ui/*`.
- Reuse `Button` and `Input` components instead of raw `<button>/<input>` where appropriate.
- Treat the example app as a functional reference only, not a UI design to copy verbatim.
- Fit UI decisions to the requested project's goals, audience, and product constraints.
- Avoid copying demo-specific styling/layout/content choices unless explicitly requested.
- When introducing a new UI component, add:
  - `src/lib/components/ui/<name>/<name>.svelte`
  - `src/lib/components/ui/<name>/index.ts`
- Keep `docs/SHADCN_SVELTE.md` updated when new components are added.

## Example/demo requirements

- Keep these examples working:
  - shared-state operations with `sendUpdate`/`setUpdateListener`
  - notify/reply-by-address behavior
  - `sendToChat()` text and file export
  - `importFiles()` example
  - realtime native + emulation mode
  - `@webxdc/realtime` helper example
- Keep example behavior intact even when adapting the UI for real project needs.
- If payload shape changes, update both code and docs.

## Build/test requirements

Before finalizing changes, run:

- `bun run check`
- `bun run build`

For release/packaging changes, also run:

- `bun run package:release`

## Release/versioning requirements

- Preserve semantic-release flow (`.releaserc.json`, `.github/workflows/ci.yml`).
- Preserve artifact naming convention:
  - `webxdc-svelte-shadcn-template_vX-Y-Z.xdc`
  - `webxdc-svelte-shadcn-template_vX-Y-Z.zip`
- Keep `.xdc` packages excluding `webxdc.js`.

## Conventional commit policy

Use conventional commits for release automation:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `chore: ...`

Breaking changes must include `BREAKING CHANGE:` footer.
