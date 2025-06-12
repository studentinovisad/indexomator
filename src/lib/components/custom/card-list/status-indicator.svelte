<script lang="ts">
	import { cn } from '$lib/utils';

	const isInside: boolean = $props();
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
