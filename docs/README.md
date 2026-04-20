# webxdc-svelte-shadcn-template docs

This folder documents the template architecture, features, and operational behavior.

Additional UI-specific guide:

- `docs/SHADCN_SVELTE.md` (component usage, catalog reference, and AI prompt guidance)

## 1) What this template includes

- Svelte 5 + SvelteKit static output.
- webxdc API helpers in `src/lib/webxdc.ts`.
- Shared-state examples based on `sendUpdate()` + `setUpdateListener()`.
- Realtime examples:
  - native `joinRealtimeChannel()`
  - dev/emulation fallback through shared updates.
- High-level realtime/presence example using `@webxdc/realtime`.
- `sendToChat()` text and file export examples.
- `importFiles()` example with file filter support.
- CI + semantic-release automatic versioning and GitHub release assets.

## 2) Core app architecture

Main demo page: `src/routes/+page.svelte`

- Uses operation-style payloads with metadata:
  - `meta.actor`
  - `meta.lamport`
  - `meta.opId`
- Uses deterministic merge rules for local convergence.
- Tracks participants by address to support mentions/replies via `notify`.

### Operation payload types

- `counter-inc`: commutative increment operation.
- `chat-message`: chat message operation with optional `replyTo`.
- `realtime-compat`: fallback payload for realtime emulation in hosts without native realtime.

## 3) Shared-state conflict strategy

The template uses a lightweight Lamport-style strategy for deterministic ordering and idempotency:

- each local op has an incrementing Lamport number
- each op has a unique `opId`
- already-seen `opId`s are ignored
- chat display ordering uses `(lamport desc, opId)` for stable rendering

This is a practical baseline for smaller collaborative features.

## 4) `sendUpdate()` metadata usage

Template uses the optional metadata fields:

- `info`
- `href` (deep link anchors like `#chat`, `#realtime`)
- `document`
- `summary`
- `notify`

Deep-link navigation is handled via hash and scroll behavior in the page.

## 5) Mentions/replies with `notify`

The chat flow tracks known participant addresses and supports mention-like replies:

- participant addresses are captured from incoming operation metadata (`meta.actor`)
- user can choose a reply target from known addresses
- each `chat-message` send builds `notify` for all known participants
- if reply target is selected, that address gets a dedicated reply notification text
- wildcard `*` fallback notification is also included

Result: if you know an address, you can target it as a reply notification while still notifying all participants.

## 6) `sendUpdate` limits and queueing

`src/lib/webxdc.ts` includes a queued sender:

- reads `webxdc.sendUpdateInterval` and `webxdc.sendUpdateMaxSize`
- sends updates in order
- waits according to interval
- skips oversized updates with a warning

UI displays currently detected limits.

## 7) Realtime behavior

### Native realtime path

- Uses `joinRealtimeChannel()` when host supports it.
- Sends/receives ephemeral low-latency messages.

### Emulated realtime path

- Used when native realtime is not available in host.
- Uses shared `sendUpdate()` transport for developer testing behavior.

## 8) `@webxdc/realtime` integration

The template includes a dedicated helper demo:

- connect/disconnect lifecycle
- peer list updates (`onPeersChanged`)
- presence state advertisement (`setState`)
- object payload send/receive (`sendPayload`, `onPayload`)

This helper is best suited for small chats.
For large groups (for example ~200 participants), frequent peer-state ads can overload realtime traffic. Prefer durable `sendUpdate()` for most state in large chats.

## 9) File import/export examples

### Import

- `importWebxdcFiles()` helper.
- Uses host `importFiles()` when available.
- Falls back to browser file input for unsupported hosts.

### Export

- `sendTextToChat()` for text message draft.
- `sendTextFileToChat()` for generated file draft (`shared-state.json` example).

## 10) Dev shim (`static/webxdc.js`)

Used for local browser runs where messenger host API is absent.

Provides:

- `sendUpdate` + `setUpdateListener`
- `sendToChat`
- `importFiles`
- `joinRealtimeChannel` shim
- `sendUpdateInterval` and `sendUpdateMaxSize` defaults for local testing

Note: this shim is for development only.

## 11) Packaging rules

- `.xdc` packages exclude `webxdc.js` (host provides it at runtime).
- Local build script:
  - `bun run build:xdc`
  - `bun run package:release`

Versioned release artifacts follow:

- `webxdc-svelte-shadcn-template_vX-Y-Z.xdc`
- `webxdc-svelte-shadcn-template_vX-Y-Z.zip`

## 12) CI and automatic versioning

Configured with semantic-release:

- config file: `.releaserc.json`
- workflow: `.github/workflows/ci.yml`
- release branch: `main`
- tag format: `vX.Y.Z`

On release:

- determines next version from commit history
- updates `package.json`, `CHANGELOG.md`, `.version`
- builds versioned assets and publishes to GitHub Release

## 13) Suggested commit conventions

Use conventional commits to drive semantic-release:

- `feat: ...` -> minor
- `fix: ...` -> patch
- breaking change footer (`BREAKING CHANGE:`) -> major
