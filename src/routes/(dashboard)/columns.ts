import { renderComponent } from '$lib/components/ui/data-table';
import type { Person, PersonType } from '$lib/types/person';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Person>[] = [
	{
		accessorKey: 'type',
		header: 'Type'
	},
	{
		accessorKey: 'fname',
		header: 'First name',
		meta: {
			editable: true,
		}
	},
	{
		accessorKey: 'lname',
		header: 'Last name',
		meta: {
			editable: true,
		}
	},
	{
		accessorKey: 'identifier',
		header: 'Identifier'
	},
	{
		accessorKey: 'department',
		header: 'Department',
		meta: {
			editable: true,
		}
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
		header: 'Actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id,
				type: row.original.type
			});
		},
		enableSorting: false
	}
];
