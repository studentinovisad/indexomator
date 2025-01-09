<script lang="ts">
	import { ArrowLeftRight, Pencil, Check } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { searchStore } from '$lib/stores/search.svelte';
	import type { Table } from '@tanstack/table-core';
	import type { Person } from '$lib/types/person';
	import { fly } from 'svelte/transition';

	let { id, type, table }: { id: number; type: string; table: Table<Person> } = $props();

	function onEditButtonClick() {
		table.options?.meta?.setEditStatus(id, true);
	}

	function isSaveButton(): boolean {
		return table.options !== null ? table.options.meta?.getEditStatus(id) === true : false;
	}
</script>

<div class="flex gap-2">
	<form method="POST" action="?/togglestate" class="w-full" use:enhance>
		<Input type="hidden" name="q" value={searchStore.query} />
		<Input type="hidden" name="type" value={type} />
		<Button variant="outline" type="submit" name="id" value={id} class="w-full">
			<ArrowLeftRight /> <span class="hidden sm:block">Toggle State</span>
		</Button>
	</form>
	{#if isSaveButton()}
		<form method="POST" action="?/edit" class="w-full" use:enhance in:fly>
			{#each table._getColumnDefs() as def}
				{#if def.meta?.editable === true}
					<Input type="hidden" name={def.accessorKey} value="" />
				{/if}
			{/each}
			<Button variant="default" class="w-full" type="submit" name="id" value={id}>
				<Check /> <span class="hidden sm:block">Save</span>
			</Button>
		</form>
	{:else}
		<div class="w-full" in:fly>
			<Button variant="outline" onclick={onEditButtonClick} class="w-full">
				<Pencil /> <span class="hidden sm:block">Edit</span>
			</Button>
		</div>
	{/if}
</div>
