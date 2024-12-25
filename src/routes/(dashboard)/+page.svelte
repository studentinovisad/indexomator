<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Search from 'lucide-svelte/icons/search';
	import Reset from 'lucide-svelte/icons/list-restart';
	import DataTable from './data-table.svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { columns } from './columns';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data, form: actionData } = $props();

	$effect(() => {
		const msg = actionData?.message;
		if (msg !== undefined) {
			if ($page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});

	let searchQuery = $state('');
	const persons = $derived(actionData?.persons ?? data.persons ?? []);
</script>

<form
	method="POST"
	action="?/search"
	class="flex gap-2 px-4 py-2"
	use:enhance={() => {
		return async ({ update }) => {
			await update({ reset: false });
		};
	}}
>
	<Input id="search" class="max-w-xs" placeholder="Search..." name="q" bind:value={searchQuery} />
	<Button type="submit" size="icon" class="flex-shrink-0">
		<Search />
	</Button>
	<Button
		onclick={() => goto('/')}
		type="reset"
		variant="destructive"
		size="icon"
		class="flex-shrink-0"
	>
		<Reset />
	</Button>
</form>
<Separator />
<div class="m-0 sm:m-4">
	<DataTable data={persons} {columns} />
</div>
