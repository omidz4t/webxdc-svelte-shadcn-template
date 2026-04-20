# shadcn-svelte in This Template

This project already uses reusable shadcn-style components. Keep using them instead of sprinkling raw controls all over route files.

## Current Components in Use

- `Button` from `$lib/components/ui/button`
- `Input` from `$lib/components/ui/input`

Both are used in `src/routes/+page.svelte`.

## Default Pattern

Import from `$lib/components/ui/*` and compose UI from those building blocks:

```svelte
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
</script>

<Input bind:value={text} placeholder="Type..." />
<Button onclick={save}>Save</Button>
<Button variant="outline">Cancel</Button>
```

## Adding New Components

Use the shadcn-svelte generator:

```sh
bun x shadcn-svelte@latest add <component>
```

Keep the project structure consistent:

- `src/lib/components/ui/<component>/<component>.svelte`
- `src/lib/components/ui/<component>/index.ts`

If you add or remove components, update this doc in the same PR.

## Practical UI Rules for This Repo

- Prefer reusable shadcn components over raw `<button>` / `<input>` in page files.
- Keep accessibility attributes (`type`, `disabled`, labels, focus states) intact.
- Keep route files focused on behavior; move reusable UI into `src/lib/components/ui`.
- Run `bun run check` after UI changes.

## Prompt Template for AI Edits

Use this when asking an assistant to make UI changes:

```text
Edit <target-file>.
Use existing shadcn components from $lib/components/ui/*.
Do not use raw HTML controls unless there is no matching component.
If a new component is needed, add it under src/lib/components/ui/<name>/ with index.ts export.
Preserve accessibility attributes.
Run bun run check.
```

## Component Catalog

The full component list lives in the official docs:

- [shadcn-svelte components](https://shadcn-svelte.com/docs/components)
- [shadcn-svelte project docs](https://www.shadcn-svelte.com/)
