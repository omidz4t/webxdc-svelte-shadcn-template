<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'outline' | 'ghost';
	type Size = 'default' | 'sm';

	let {
		type = 'button',
		variant = 'default',
		size = 'default',
		disabled = false,
		class: className = '',
		children,
		...restProps
	}: {
		type?: 'button' | 'submit' | 'reset';
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	const base =
		'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50';
	const variantClass = $derived(
		{
			default: 'bg-zinc-900 text-white hover:bg-zinc-700',
			outline: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-100',
			ghost: 'text-zinc-700 hover:bg-zinc-100'
		}[variant]
	);
	const sizeClass = $derived(
		{
			default: 'px-4 py-2',
			sm: 'px-2 py-1 text-xs'
		}[size]
	);
</script>

<button
	{type}
	{disabled}
	class={`${base} ${variantClass} ${sizeClass} ${className}`}
	{...restProps}
>
	{@render children?.()}
</button>
