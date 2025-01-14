<script lang="ts">
	import { ArrowLeftRight, Pencil, Check } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { searchStore } from '$lib/stores/search.svelte';
	import type { Row, Table } from '@tanstack/table-core';
	import type { Person } from '$lib/types/person';
	import { fly } from 'svelte/transition';
	import DataTableHidden from './data-table-hidden.svelte';

	let { row, table }: { row: Row<Person>; table: Table<Person> } = $props();

	const columnDefs = table._getColumnDefs();

	function onEditButtonClick() {
		const obj = Object.fromEntries(
			Object.keys(row.original)
				.filter(
					(val) => columnDefs.find((val1) => val1.accessorKey === val)?.meta?.editable === true
				)
				.map((val) => [val, row.original[val]])
		);

		table.options?.meta?.setEditChanges(row.original.id, obj);
	}

	function isSaveButton(): boolean {
		return table.options !== null
			? table.options.meta?.hasEditChanges(row.original.id) === true
			: false;
	}

	function onCancelButtonClick() {
		table.options?.meta?.setEditChanges(row.original.id);
	}
</script>

<div class="flex gap-2">
	<form method="POST" action="?/togglestate" class="w-full" use:enhance>
		<Input type="hidden" name="q" value={searchStore.query} />
		<Input type="hidden" name="type" value={row.original.type} />
		<Button variant="outline" type="submit" name="id" value={row.original.id} class="w-full">
			<ArrowLeftRight /> <span class="hidden sm:block">Toggle State</span>
		</Button>
	</form>
	{#if isSaveButton()}
		<div class="flex w-full gap-2">
			<form
				method="POST"
				action="?/edit"
				class="w-full"
				use:enhance={() => {
					return async ({ update, result }) => {
						update();
						if (result.type === 'success') {
							table.options?.meta?.setEditChanges(row.original.id);
						}
					};
				}}
				in:fly
			>
				<DataTableHidden {table} {row} />
				<Button variant="default" class="w-full" type="submit" name="id" value={row.original.id}>
					<Check /> <span class="hidden sm:block">Save</span>
				</Button>
			</form>
			<Button variant="destructive" class="w-full" onclick={onCancelButtonClick}>
				<Check /> <span class="hidden sm:block">Cancel</span>
			</Button>
		</div>
	{:else}
		<div class="w-full" in:fly>
			<Button variant="outline" onclick={onEditButtonClick} class="w-full">
				<Pencil /> <span class="hidden sm:block">Edit</span>
			</Button>
		</div>
	{/if}
</div>
