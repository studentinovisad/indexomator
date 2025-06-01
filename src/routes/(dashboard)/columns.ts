import { renderComponent } from '$lib/components/ui/data-table';
import type { Guest, Person } from '$lib/types/person';
import type { ColumnDef } from '@tanstack/table-core';
import type { FormSubmitFunction } from '$lib/utils';
import PersonActionButtons from './person-action-buttons.svelte';

export function createColumns(
	userBuilding: string,
	toggleStateFormSubmit: FormSubmitFunction,
	toggleGuestStateFormSubmit: FormSubmitFunction,
	showGuestsFormSubmit: FormSubmitFunction
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
				return renderComponent(PersonActionButtons, {
					person,
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
