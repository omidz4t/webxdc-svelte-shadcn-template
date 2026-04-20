# Project Docs

This template already solves the annoying parts of webxdc app setup: local dev shim, typed host API helpers, shared-state demo, and packaging scripts.

If you want a fast map of the project before you start editing, read this file once.

## What You Get Out of the Box

- `src/routes/+page.svelte`: the main demo app with shared counter, chat, import/export, and realtime examples.
- `src/lib/webxdc.ts`: typed wrappers for `sendUpdate`, `setUpdateListener`, `sendToChat`, `importFiles`, and realtime channels.
- `src/lib/index.ts`: `$lib` barrel file (currently a placeholder, ready for shared exports).
- `static/webxdc.js`: browser-only shim so the app works outside a messenger during local development.
- `src/routes/+layout.ts`: `prerender = true` for static output.
- `src/routes/+layout.svelte` and `src/routes/layout.css`: app shell and global Tailwind setup.
- `src/routes/example_+page.svelte`: alternate demo page kept as a reference copy.

## How the Main Demo Works

The main page models all shared changes as operations with metadata:

- `meta.actor`: sender address (`selfAddr`)
- `meta.lamport`: monotonic logical time
- `meta.opId`: unique operation id

Payload types used in the demo:

- `counter-inc`: conflict-safe counter increments
- `chat-message`: shared chat messages with optional `replyTo`
- `realtime-compat`: fallback payload for hosts without native realtime

The merge strategy is simple and practical:

- ignore duplicate `opId`s
- keep Lamport monotonic locally
- sort chat by `(lamport desc, opId)` for stable ordering

## sendUpdate Metadata (What It Is Used For)

The template actively uses optional metadata fields when sending updates:

- `href` to deep-link sections like `#counter`, `#chat`, `#realtime`
- `document` and `summary` for readable update context
- `notify` for participant-specific notifications and wildcard fallback

This is not just demo fluff. It is a good default pattern for real collaborative apps.

## Mentions and Reply Notifications

The chat demo tracks known participant addresses from incoming metadata and builds a `notify` map on send:

- everyone gets a wildcard message via `notify['*']`
- reply targets get a specific `"Reply from ..."` message

That gives you targeted notifications without losing broad visibility.

## Realtime: Two Modes, One Rule

The project supports two realtime paths:

1. Native low-level channel with `joinRealtimeChannel()`
2. Emulated fallback through `sendUpdate()` (for hosts/dev where native channel is unavailable)

It also includes an `@webxdc/realtime` helper demo for peer presence and object payload sync.

Important: use one realtime mode at a time. The UI prevents running low-level channel and helper mode together.

## Import and Export

Import:

- `importWebxdcFiles()` uses host `importFiles()` when available
- falls back to `<input type="file">` in unsupported environments

Export:

- `sendTextToChat(text)` creates a text draft
- `sendTextFileToChat(name, content)` creates a file draft (example: `shared-state.json`)

## Dev Shim Behavior

`static/webxdc.js` is a local shim, not production host logic.

It provides:

- update listener and history replay
- `sendToChat` draft simulation
- `importFiles` picker behavior
- BroadcastChannel-based realtime shim
- default limits (`sendUpdateInterval: 250`, `sendUpdateMaxSize: 128000`)

`.xdc` archives exclude this file because messenger hosts provide `window.webxdc`.

## Build, Package, Release

Common commands:

```sh
bun run dev
bun run check
bun run build
bun run build:xdc
bun run package:release
```

Release flow uses semantic-release on `main` and publishes versioned artifacts:

- `webxdc-svelte-shadcn-template_vX-Y-Z.xdc`
- `webxdc-svelte-shadcn-template_vX-Y-Z.zip`

## Where to Read Next

- UI component guidance: `docs/SHADCN_SVELTE.md`
- Root quick-start and pointers: `README.md`
