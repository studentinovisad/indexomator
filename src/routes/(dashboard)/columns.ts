import { renderComponent } from '$lib/components/ui/data-table';
import type { Person } from '$lib/types/person';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Person>[] = [
	{
		accessorKey: 'type',
		header: 'Type'
	},
	{
		accessorKey: 'fname',
		header: 'First name'
	},
	{
		accessorKey: 'lname',
		header: 'Last name'
	},
	{
		accessorKey: 'identifier',
		header: 'Identifier'
	},
	{
		accessorKey: 'department',
		header: 'Department'
	},
	{
		accessorKey: 'university',
		header: 'University'
	},
	{
		accessorKey: 'building',
		header: 'Building'
	},
	{
		accessorKey: 'state',
		header: 'State'
	},
	{
		id: 'actions',
		header: 'Toggle State',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id,
				guarantorId: row.original.guarantorId
			});
		},
		enableSorting: false
	}
];
