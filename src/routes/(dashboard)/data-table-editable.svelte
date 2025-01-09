<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { Person } from '$lib/types/person';
	import type { Table } from '@tanstack/table-core';
	import { fly } from 'svelte/transition';
	import * as Select from '$lib/components/ui/select';

	let {
		id,
		value,
		choices = null,
		name,
		enabled = false,
		table
	}: {
		id: number;
		value: string;
		choices?: string[] | null;
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
	{#if choices === null}
		<div in:fly>
			<Input class="w-min field-sizing-content" bind:value={getChangesMap, updateChangesMap} />
		</div>
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
