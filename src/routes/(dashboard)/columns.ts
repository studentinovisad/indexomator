import { renderComponent } from '$lib/components/ui/data-table';
import type { Person } from '$lib/types/person';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';
import type { ToggleStateEnhance, ToggleStateForm } from './schema';

export function createColumns(
	userBuilding: string,
	toggleStateForm: ToggleStateForm,
	toggleStateEnhance: ToggleStateEnhance
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
			id: 'actions',
			header: 'Toggle State',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					personId: row.original.id,
					guarantorId: row.original.guarantorId,
					building: row.original.building,
					state: row.original.state,
					userBuilding,
					toggleStateForm,
					toggleStateEnhance
				});
			},
			enableSorting: false,
			enableColumnFilter: false,
			enableGrouping: false
		}
	];
}
