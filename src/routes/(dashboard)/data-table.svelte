<script lang="ts">
	import {
		type ColumnDef,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type PaginationState,
		type SortingState
	} from '@tanstack/table-core';
	import {
		createSvelteTable,
		FlexRender,
		renderComponent
	} from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { Person } from '$lib/types/person';
	import { SvelteMap } from 'svelte/reactivity';
	import DataTableEditable from './data-table-editable.svelte';
	import type { PersonEditable } from './columns';

	type DataTableProps<Person> = {
		columns: ColumnDef<Person>[];
		data: Person[];
	};

	let { data, columns }: DataTableProps<Person> = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let editables = new SvelteMap<number, PersonEditable>();

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get editables() {
				return editables;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		meta: {
			setEditChanges: (id: number, changes?: PersonEditable) => {
				changes === null || changes === undefined
					? editables.delete(id)
					: editables.set(id, changes);
			},
			getEditChanges: (id: number): PersonEditable | null => {
				return editables.get(id) ?? null;
			},
			hasEditChanges: (id: number): boolean => {
				return editables.has(id);
			}
		},
		defaultColumn: {
			cell: ({ row, table, column: { columnDef }, cell }) =>
				renderComponent(DataTableEditable, {
					id: row.original.id,
					value: cell.getValue() as string,
					name: columnDef.accessorKey,
					enabled: columnDef.meta?.editable,
					table: table
				})
		}
	});
</script>

<div class="mx-auto my-5 w-full rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head>
							{#if !header.isPlaceholder}
								<div
									class="flex cursor-pointer items-center"
									role="button"
									tabindex="0"
									onclick={() => {
										header.column.toggleSorting();
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											header.column.toggleSorting();
										}
									}}
								>
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
									{#if header.column.getIsSorted() === 'asc'}
										<span class="m-1">↑</span>
									{:else if header.column.getIsSorted() === 'desc'}
										<span class="m-1">↓</span>
									{:else}
										<span></span>
									{/if}
								</div>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
<div class="flex items-center justify-center space-x-2 py-4">
	<Button
		variant="outline"
		size="sm"
		onclick={() => table.previousPage()}
		disabled={!table.getCanPreviousPage()}
	>
		Previous
	</Button>
	<Button
		variant="outline"
		size="sm"
		onclick={() => table.nextPage()}
		disabled={!table.getCanNextPage()}
	>
		Next
	</Button>
</div>
