<script lang="ts">
	let {
		type = 'text',
		value = $bindable(''),
		class: className = '',
		...restProps
	}: {
		type?: string;
		value?: string;
		class?: string;
		[key: string]: unknown;
	} = $props();

	const base =
		'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-400';
</script>

<input {type} bind:value class={`${base} ${className}`} {...restProps} />
