<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { SearchIcon } from 'lucide-svelte';

	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className,
		...restProps
	}: WithElementRef<HTMLInputAttributes> = $props();

	let autofocus = $state(false);
</script>

<div class="flex items-center border-b px-2" data-command-input-wrapper="">
	<SearchIcon class="mr-2 size-4 shrink-0 opacity-50" />
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:this={ref}
		class={cn(
			'flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			className
		)}
		bind:value
		onfocusin={() => {
			autofocus = true;
		}}
		onfocusout={() => {
			autofocus = false;
		}}
		{autofocus}
		{...restProps}
	/>
</div>
