<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Search from 'lucide-svelte/icons/search';
	import DataTable from './data-table.svelte';
	import { columns } from './columns';
	import { enhance } from '$app/forms';

	let { data } = $props();
	const searchQuery = data.searchQuery;
</script>

<div>
	<form action="/search" use:enhance>
		<div class="hidden gap-2 px-4 py-2 sm:flex">
			<Input id="search" class="max-w-xs" placeholder="Search..." name="q" value={searchQuery} />
			<Button type="submit" variant="outline" size="icon" class="flex-shrink-0">
				<Search />
			</Button>
		</div>
		<div class="flex gap-2 px-4 py-2 sm:hidden">
			<Drawer.Root>
				<Drawer.Trigger class="block w-full sm:hidden"
					><Button class="w-full">Search</Button></Drawer.Trigger
				>
				<Drawer.Content>
					<div class="grid gap-4 p-10">
						<div class="grid gap-2">
							<Label for="search">Search</Label>
							<Input id="search" placeholder="Search..." name="q" value={searchQuery} />
						</div>
					</div>
					<Drawer.Footer>
						<Button>Search</Button>
						<Drawer.Close>
							<Button variant="destructive" class="w-full">Reset</Button>
						</Drawer.Close>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</form>
	<Separator />
	<div class="m-0 sm:m-4">
		<DataTable data={data.persons} {columns} />
	</div>
</div>
