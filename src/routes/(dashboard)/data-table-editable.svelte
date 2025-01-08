<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { Person } from '$lib/types/person';
	import type { Table } from '@tanstack/table-core';

	let {
		id,
		value,
		enabled = false,
		table
	}: { id: number; value: string; enabled?: boolean; table: Table<Person> } = $props();
</script>

{#if enabled && table.options !== null && table.options.meta?.getEditStatus(id)}
	<Input {value} class="field-sizing-content w-min" />
{:else}
	{value}
{/if}
