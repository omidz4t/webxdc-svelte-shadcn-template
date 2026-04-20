# shadcn-svelte in this template

This template includes a shadcn-style component structure and currently uses reusable UI components from:

- `src/lib/components/ui/button`
- `src/lib/components/ui/input`

They are already used in `src/routes/+page.svelte` instead of raw `<button>` and `<input>` tags.

## Current usage pattern

Import components directly from `$lib/components/ui/*`:

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
</script>

<Input bind:value={text} placeholder="Type..." />
<Button onclick={save}>Save</Button>
<Button variant="outline">Cancel</Button>
```

## Extending with more shadcn-svelte components

When adding components, keep the same file organization:

- `src/lib/components/ui/<component>/<component>.svelte`
- `src/lib/components/ui/<component>/index.ts`

Then use those components in pages and demos.

Official project/docs:

- [shadcn-svelte docs](https://www.shadcn-svelte.com/)

## Component catalog reference

From shadcn-svelte docs:

- [Accordion](https://shadcn-svelte.com/docs/components/accordion)
- [Alert Dialog](https://shadcn-svelte.com/docs/components/alert-dialog)
- [Alert](https://shadcn-svelte.com/docs/components/alert)
- [Aspect Ratio](https://shadcn-svelte.com/docs/components/aspect-ratio)
- [Avatar](https://shadcn-svelte.com/docs/components/avatar)
- [Badge](https://shadcn-svelte.com/docs/components/badge)
- [Breadcrumb](https://shadcn-svelte.com/docs/components/breadcrumb)
- [Button Group](https://shadcn-svelte.com/docs/components/button-group)
- [Button](https://shadcn-svelte.com/docs/components/button)
- [Calendar](https://shadcn-svelte.com/docs/components/calendar)
- [Card](https://shadcn-svelte.com/docs/components/card)
- [Carousel](https://shadcn-svelte.com/docs/components/carousel)
- [Chart](https://shadcn-svelte.com/docs/components/chart)
- [Checkbox](https://shadcn-svelte.com/docs/components/checkbox)
- [Collapsible](https://shadcn-svelte.com/docs/components/collapsible)
- [Combobox](https://shadcn-svelte.com/docs/components/combobox)
- [Command](https://shadcn-svelte.com/docs/components/command)
- [Context Menu](https://shadcn-svelte.com/docs/components/context-menu)
- [Data Table](https://shadcn-svelte.com/docs/components/data-table)
- [Date Picker](https://shadcn-svelte.com/docs/components/date-picker)
- [Dialog](https://shadcn-svelte.com/docs/components/dialog)
- [Drawer](https://shadcn-svelte.com/docs/components/drawer)
- [Dropdown Menu](https://shadcn-svelte.com/docs/components/dropdown-menu)
- [Empty](https://shadcn-svelte.com/docs/components/empty)
- [Field](https://shadcn-svelte.com/docs/components/field)
- [Formsnap](https://shadcn-svelte.com/docs/components/form)
- [Hover Card](https://shadcn-svelte.com/docs/components/hover-card)
- [Input Group](https://shadcn-svelte.com/docs/components/input-group)
- [Input OTP](https://shadcn-svelte.com/docs/components/input-otp)
- [Input](https://shadcn-svelte.com/docs/components/input)
- [Item](https://shadcn-svelte.com/docs/components/item)
- [Kbd](https://shadcn-svelte.com/docs/components/kbd)
- [Label](https://shadcn-svelte.com/docs/components/label)
- [Menubar](https://shadcn-svelte.com/docs/components/menubar)
- [Native Select](https://shadcn-svelte.com/docs/components/native-select)
- [Navigation Menu](https://shadcn-svelte.com/docs/components/navigation-menu)
- [Pagination](https://shadcn-svelte.com/docs/components/pagination)
- [Popover](https://shadcn-svelte.com/docs/components/popover)
- [Progress](https://shadcn-svelte.com/docs/components/progress)
- [Radio Group](https://shadcn-svelte.com/docs/components/radio-group)
- [Range Calendar](https://shadcn-svelte.com/docs/components/range-calendar)
- [Resizable](https://shadcn-svelte.com/docs/components/resizable)
- [Scroll Area](https://shadcn-svelte.com/docs/components/scroll-area)
- [Select](https://shadcn-svelte.com/docs/components/select)
- [Separator](https://shadcn-svelte.com/docs/components/separator)
- [Sheet](https://shadcn-svelte.com/docs/components/sheet)
- [Sidebar](https://shadcn-svelte.com/docs/components/sidebar)
- [Skeleton](https://shadcn-svelte.com/docs/components/skeleton)
- [Slider](https://shadcn-svelte.com/docs/components/slider)
- [Sonner](https://shadcn-svelte.com/docs/components/sonner)
- [Spinner](https://shadcn-svelte.com/docs/components/spinner)
- [Switch](https://shadcn-svelte.com/docs/components/switch)
- [Table](https://shadcn-svelte.com/docs/components/table)
- [Tabs](https://shadcn-svelte.com/docs/components/tabs)
- [Textarea](https://shadcn-svelte.com/docs/components/textarea)
- [Toggle Group](https://shadcn-svelte.com/docs/components/toggle-group)
- [Toggle](https://shadcn-svelte.com/docs/components/toggle)
- [Tooltip](https://shadcn-svelte.com/docs/components/tooltip)
- [Typography](https://shadcn-svelte.com/docs/components/typography)

## How to ask AI to use components

When asking an AI assistant to add UI in this project, use explicit prompts like:

- "Use existing shadcn components from `$lib/components/ui/button` and `$lib/components/ui/input`, do not use raw `<button>`/`<input>`."
- "If you need a new component, create it under `src/lib/components/ui/<name>/` with an `index.ts` export."
- "Prefer composing reusable shadcn-style components over inline Tailwind classes in pages."
- "Update docs in `docs/SHADCN_SVELTE.md` when adding new UI components."

Recommended constraints in prompts:

- mention exact file to edit
- mention desired component variants/sizes
- require keeping accessibility attributes (`type`, `disabled`, labels, focus states)
- require running `bun run check` after edits
