<script lang="ts">
	import { ArrowLeftRight, Pencil, Check } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { searchStore } from '$lib/stores/search.svelte';
	import type { Table } from '@tanstack/table-core';
	import type { Person } from '$lib/types/person';

	let { id, type, table }: { id: number; type: string; table: Table<Person> } = $props();

	function onEditButtonClick() {
		if (table.options !== null) {
			let status = table.options.meta?.getEditStatus(id) ?? false;
			table.options.meta?.setEditStatus(id, !status);
		}
	}

	function isSaveButton(): boolean {
		return table.options !== null
			? table.options.meta?.getEditStatus(id) == true
			: false;
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
	{#if table}
		<Button
			variant={isSaveButton() ? 'default' : 'outline'}
			onclick={onEditButtonClick}
			class="w-full"
		>
			{#if isSaveButton()}
				<Check /> <span class="hidden sm:block">Save</span>
			{:else}
				<Pencil /> <span class="hidden sm:block">Edit</span>
			{/if}
		</Button>
	{/if}
</div>
