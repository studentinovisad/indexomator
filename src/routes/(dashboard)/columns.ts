import type { Person } from '$lib/types/person';
import type { ColumnDef } from '@tanstack/table-core';

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
		accessorKey: 'state',
		header: 'State'
	}
];
