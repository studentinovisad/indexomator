<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { Person } from '$lib/types/person';
	import type { Row, Table } from '@tanstack/table-core';
	import { fly } from 'svelte/transition';
	import * as Select from '$lib/components/ui/select';
	import { enhance } from '$app/forms';
	import DataTableHidden from './data-table-hidden.svelte';

	let {
		id,
		value,
		choices = null,
		name,
		enabled = false,
		row,
		table
	}: {
		id: number;
		value: string;
		choices?: string[] | null;
		name: string;
		enabled?: boolean;
		row: Row<Person>,
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
	{#if choices === null}
		<form method="POST" action="?/edit" in:fly use:enhance={() => {
			return async ({ update, result }) => {
				update();
				if (result.type === 'success') {
					table.options?.meta?.setEditChanges(row.original.id);
				}
			};
		}}>
			<Input type="hidden" name="id" value={row.original.id} />
			<DataTableHidden {table} {row} />
			<Input class="w-min field-sizing-content" bind:value={getChangesMap, updateChangesMap} />
		</form>
	{:else}
		<div in:fly>
			<Select.Root type="single" bind:value={getChangesMap, updateChangesMap}>
				<Select.Trigger>
					{getChangesMap()}
				</Select.Trigger>
				<Select.Content>
					{#each choices as choice}
						<Select.Item value={choice}>{choice}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/if}
{:else}
	<div in:fly>
		{value}
	</div>
{/if}
