<script lang="ts">
	import type { Person } from '$lib/types/person';
	import { StateInside } from '$lib/types/state';
	import { cn } from '$lib/utils';

	let { person }: { person: Person } = $props();
	const isInside = $derived(person.state === StateInside);
</script>

<div class="p-3">
	<span
		class={cn(
			'inline-block',
			'h-2 w-2',
			'rounded-full',
			'mb-0.5',
			isInside ? 'bg-green-600' : 'bg-red-600'
		)}
	></span>
</div>
