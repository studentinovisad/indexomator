import { renderComponent } from '$lib/components/ui/data-table';
import type { Person, PersonType } from '$lib/types/person';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Person>[] = [
	{
		accessorKey: 'id',
		header: 'internal_id'
	},
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
		accessorKey: 'state',
		header: 'State'
	},
	{
		id: 'actions',
		header: 'Toggle State',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.getVisibleCells()[0].getValue() as number,
				type: row.getVisibleCells()[1].getValue() as PersonType
			});
		}
	}
];
