import type { Person } from '$lib/types/person';
import type { ColumnDef } from '@tanstack/table-core';

export const columns: ColumnDef<Person>[] = [
	{
		accessorKey: 'type',
		header: 'Type'
	},
	{
		accessorKey: 'id',
		header: 'ID'
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
		accessorKey: 'index',
		header: 'Index'
	},
	{
		accessorKey: 'state',
		header: 'State'
	}
];
