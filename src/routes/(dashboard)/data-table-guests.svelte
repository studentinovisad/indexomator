<script lang="ts">
	import {
		type ColumnDef,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type PaginationState,
		type SortingState
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { Guest } from '$lib/types/person';

	type DataTableProps<Guest> = {
		columns: ColumnDef<Guest>[];
		data: Guest[];
	};

	let { data, columns }: DataTableProps<Guest> = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 5 });
	let sorting = $state<SortingState>([]);

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
		getSortedRowModel: getSortedRowModel()
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
{#if data.length > pagination.pageSize}
	<div class="flex items-center justify-center space-x-2">
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
{/if}
