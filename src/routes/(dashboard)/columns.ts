import { renderComponent } from '$lib/components/ui/data-table';
import type { Person } from '$lib/types/person';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';

export function createColumns(
	userBuilding: string,
	toggleStateFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void
): ColumnDef<Person>[] {
	return [
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
			accessorKey: 'totalHoursSpent',
			header: 'THS'
		},
		{
			id: 'actions',
			header: 'Toggle State',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					personId: row.original.id,
					guarantorFname: row.original.guarantorFname,
					guarantorLname: row.original.guarantorLname,
					guarantorIdentifier: row.original.guarantorIdentifier,
					personType: row.original.type,
					personState: row.original.state,
					building: row.original.building,
					userBuilding,
					toggleStateFormSubmit
				});
			},
			enableSorting: false,
			enableColumnFilter: false,
			enableGrouping: false
		}
	];
}
