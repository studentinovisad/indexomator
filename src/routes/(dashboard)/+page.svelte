<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Search from 'lucide-svelte/icons/search';
	import Reset from 'lucide-svelte/icons/list-restart';
	import Chart from 'lucide-svelte/icons/chart-no-axes-combined';
	import DataTable from './data-table.svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { columns } from './columns';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import InsideCountPerBuilding from '../../lib/components/custom/insideCountPerBuilding.svelte';

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
	const studentsInside = $derived(data.studentsInside ?? []);
	const employeesInside = $derived(data.employeesInside ?? []);
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
	<Dialog.Root>
		<Dialog.Trigger
			><Button variant="secondary" size="icon" class="flex-shrink-0"><Chart /></Button
			></Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Statistics</Dialog.Title>
			</Dialog.Header>
			<Dialog.Description>Check how many people are currently inside.</Dialog.Description>
			<div class="flex w-full">
				<InsideCountPerBuilding dataStudents={studentsInside} dataEmployees={employeesInside} />
			</div>
		</Dialog.Content>
	</Dialog.Root>
</form>

<Separator />
<div class="m-0 sm:m-4">
	<DataTable data={persons} {columns} />
</div>
