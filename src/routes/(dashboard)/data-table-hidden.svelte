<script lang="ts">

	import { Input } from "$lib/components/ui/input";
	import type { Person } from "$lib/types/person";
	import type { Row, Table } from "@tanstack/table-core";

    let {table, row} : {table: Table<Person>, row: Row<Person>} = $props();

    const columnDefs = table._getColumnDefs();

    function getValueFromKey(key: string): any | null {
		if (table.options !== null) {
			const changes = table.options.meta?.getEditChanges(row.original.id);
			if (changes !== null) {
				return changes[key] === undefined ? null : changes[key];
			}
		}
		return null;
	}
</script>

{#each columnDefs as def}
	{#if def.meta?.editable === true}
		<Input type="hidden" name={def.accessorKey} value={getValueFromKey(def.accessorKey)} />
	{/if}
{/each}
