<script lang="ts">
	import { ArrowLeftRight, Pencil } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { searchStore } from '$lib/stores/search.svelte';

	let { id, type }: { id: number; type: string } = $props();
</script>

<div class="flex gap-2">
	<form method="POST" action="?/togglestate" class="w-full" use:enhance>
		<Input type="hidden" name="q" value={searchStore.query} />
		<Input type="hidden" name="type" value={type} />
		<Button variant="outline" type="submit" name="id" value={id} class="w-full">
			<ArrowLeftRight /> <span class="hidden sm:block">Toggle State</span>
		</Button>
	</form>
	<Button variant="outline" class="w-full">
		<Pencil /> <span class="hidden sm:block">Edit</span>
	</Button>
</div>
