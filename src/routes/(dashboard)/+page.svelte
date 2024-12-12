<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Search from 'lucide-svelte/icons/search';
	import Reset from 'lucide-svelte/icons/list-restart';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';

	let { data } = $props();
	const searchQuery = data.searchQuery;

	let searchBox: HTMLFormElement | null;
</script>

<form
	action="/"
	bind:this={searchBox}
	onreset={() => {
		searchBox?.submit();
	}}
>
	<!--reset needs to be changed !!!!!-->
	<div class="flex gap-2 px-4 py-2">
		<Input id="search" class="max-w-xs" placeholder="Search..." name="q" value={searchQuery} />
		<Button type="submit" size="icon" class="flex-shrink-0">
			<Search />
		</Button>
		<Button type="reset" variant="destructive" size="icon" class="flex-shrink-0">
			<Reset />
		</Button>
	</div>
</form>
<Separator />
<div class="m-0 sm:m-4">
	<DataTable data={data.persons ?? []} {columns} />
</div>
