import { renderComponent } from '$lib/components/ui/data-table';
import type { Guest, Person } from '$lib/types/person';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableActions from './data-table-actions.svelte';

export function createColumns(
	userBuilding: string,
	toggleStateFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void,
	toggleGuestStateFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void,
	showGuestsFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void
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
			header: 'Actions',
			cell: ({ row: { original: person } }) => {
				return renderComponent(DataTableActions, {
					personId: person.id,
					guarantorFname: person.guarantorFname,
					guarantorLname: person.guarantorLname,
					guarantorIdentifier: person.guarantorIdentifier,
					personType: person.type,
					personState: person.state,
					building: person.building,
					userBuilding,
					toggleStateFormSubmit,
					toggleGuestStateFormSubmit,
					showGuestsFormSubmit
				});
			},
			enableSorting: false,
			enableColumnFilter: false,
			enableGrouping: false
		}
	];
}

export function createColumnsGuests(): ColumnDef<Guest>[] {
	return [
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
			accessorKey: 'university',
			header: 'University'
		}
	];
}
