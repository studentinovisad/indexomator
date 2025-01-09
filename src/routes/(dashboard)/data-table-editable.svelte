<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { Person } from '$lib/types/person';
	import type { Table } from '@tanstack/table-core';
	import { fly } from 'svelte/transition';

	let {
		id,
		value,
		name,
		enabled = false,
		table
	}: {
		id: number;
		value: string;
		name: string;
		enabled?: boolean;
		table: Table<Person>;
	} = $props();

	function updateChangesMap(v: string) {
		if (table.options !== null) {
			let changes = table.options.meta?.getEditChanges(id);
			if (changes !== null) {
				changes[name] = v;
				table.options.meta?.setEditChanges(id, { ...changes });
			}
		}
	}

	function getChangesMap() {
		const changes = table.options.meta?.getEditChanges(id);
		return changes === null ? value : changes[name];
	}
</script>

{#if enabled && table.options !== null && table.options.meta?.getEditChanges(id)}
	<div in:fly>
		<Input class="w-min field-sizing-content" bind:value={getChangesMap, updateChangesMap} />
	</div>
{:else}
	<div in:fly>
		{value}
	</div>
{/if}
