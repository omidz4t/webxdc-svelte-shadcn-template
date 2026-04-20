# webxdc Svelte + Tailwind template

Starter for building `webxdc` apps with:

- Svelte 5 + SvelteKit
- TailwindCSS v4 (forms + typography plugins)
- TypeScript
- Static output ready for `.xdc` packaging

## What this template includes

- `static/webxdc.js`: a local development shim (`window.webxdc`) used when running in a normal browser.
- `src/lib/webxdc.ts`: typed helpers for `sendUpdate`, `setUpdateListener`, `sendToChat`, `importFiles`, and realtime channels.
- `static/manifest.toml`: starter webxdc manifest copied into build output.
- demo UI in `src/routes/+page.svelte` showing:
  - conflict-safe shared state operations (Lamport-style op metadata)
  - `sendToChat()` text + file export
  - `importFiles()` with extension/mime filtering
  - `href/document/summary/notify` metadata on updates
  - realtime native mode plus emulation mode for hosts without `joinRealtimeChannel()`
  - `@webxdc/realtime` helper usage for peer presence + high-level payload sync
- GitHub workflows for CI and release packaging.
- Semantic-release driven automatic versioning and GitHub releases on `main`.

## Development

```sh
bun install
bun run dev
```

`bun run dev` now starts both:

- Vite dev server at `http://localhost:5173` (`VITE_DEV_PORT` configurable)
- [`webxdc-dev`](https://github.com/webxdc/webxdc-dev) connected to that URL (default port `7100`)

If that port is busy, set a custom one:

```sh
VITE_DEV_PORT=5174 WEBXDC_DEV_PORT=7200 bun run dev
```

You can also run them separately:

```sh
bun run dev:web
bun run dev:webxdc
```

## Type checks

```sh
bun run check
```

## Build static web app

```sh
bun run build
```

This outputs static files into `build/`.

## Build `.xdc` archive locally

```sh
bun run build:xdc
```

This creates `dist/webxdc-svelte-shadcn-template.xdc`.

Note: the `.xdc` package excludes `webxdc.js` because messengers provide that file at runtime. The shim is kept for local browser development.

For versioned release artifacts matching CI format:

```sh
bun run package:release
```

This creates files like:

- `dist/webxdc-svelte-shadcn-template_v1-0-0.xdc`
- `dist/webxdc-svelte-shadcn-template_v1-0-0.zip`

## Customize for your app

- update app metadata in `static/manifest.toml`
- replace UI in `src/routes/+page.svelte`
- extend webxdc payload types in `src/lib/webxdc.ts`

## `@webxdc/realtime` usage notes

This template includes [`@webxdc/realtime`](https://github.com/webxdc/realtime) and a demo section in the page:

- advertise peer state (`setState`)
- track online peers (`onPeersChanged`)
- send object payloads (`sendPayload`)

Recommended for small chats and quick collaborative presence patterns.

For very large chats (for example ~200 participants), avoid relying on frequent realtime state updates because the traffic can overwhelm realtime channels. In those cases, prefer durable `sendUpdate()` flows for most state and reserve realtime for selective low-latency interactions.

## Full documentation

See `docs/README.md` for full implementation details, architecture, notify/reply behavior, realtime modes, and release/versioning flow.

UI component guidance and shadcn-svelte reference:

- `docs/SHADCN_SVELTE.md`

## Automatic versioning (semantic-release)

On pushes to `main`, CI runs semantic-release and automatically:

- calculates next version from conventional commits
- tags release as `vX.Y.Z`
- updates `package.json`, `CHANGELOG.md`, and `.version`
- builds and uploads versioned artifacts (`*_vX-Y-Z.xdc`, `*_vX-Y-Z.zip`) to GitHub Release

## Agent Required Reading: webxdc compatibility

All AI/code agents working in this repository must read and follow:

- [webxdc compatibility guide](https://github.com/webxdc/website/blob/main/src-docs/faq/compat.md)

Reference (raw):

- [compat.md (raw)](https://raw.githubusercontent.com/webxdc/website/main/src-docs/faq/compat.md)

### Discouraged practices

- do not use `document.cookie`; use `localStorage`
- do not rely on `unload`, `beforeunload`, or `pagehide`; use `visibilitychange`
- do not rely on `<title>` / `document.title`; use `name` in `manifest.toml`
- avoid latest JS syntax/features without compatibility consideration; transpile when needed
- do not rely on external `https://` links inside app UI; prefer embedded content or `mailto:`
- do not rely on `data:` links for downloads; use `sendToChat()` for export
- avoid features requiring permissions policy/user permissions (camera, mic, geolocation, etc.)
- do not rely on `window.open()`, `alert()`, `prompt()`, `confirm()`

### JavaScript compatibility/transpilation notes

Older devices may require transpilation (for example with Babel):

- desktop webxdc host baseline can map to older Chromium engines
- iOS webviews may be significantly older (e.g. iOS 11 level)
- Android WebView support varies by device/system component version

Use compatibility checks (for example via caniuse) before adopting newer APIs/syntax.
