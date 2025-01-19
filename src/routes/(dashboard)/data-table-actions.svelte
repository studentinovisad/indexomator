<script lang="ts">
	import { ArrowLeftRight } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { searchStore } from '$lib/stores/search.svelte';

	let { id }: { id: number } = $props();
</script>

<form method="POST" action="?/togglestate" class="w-full" use:enhance>
	<Input type="hidden" name="q" value={searchStore.query} />
	<Button variant="outline" type="submit" name="id" value={id} class="w-full">
		<ArrowLeftRight /> <span class="hidden sm:block">Toggle State</span>
	</Button>
</form>
