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
			editableChoices: (data) => {
				return data.departments.map((val) => val.name);
			}
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
		cell: ({ row, table }) => {
			return renderComponent(DataTableActions, {
				row,
				table,
			});
		},
		enableSorting: false
	}
];


export type PersonEditable = {
	fname: string,
	lname: string,
	department: string,
};