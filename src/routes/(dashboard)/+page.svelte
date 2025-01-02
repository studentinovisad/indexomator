<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Search from 'lucide-svelte/icons/search';
	import Reset from 'lucide-svelte/icons/list-restart';
	import Zap from 'lucide-svelte/icons/zap';
	import ZapOff from 'lucide-svelte/icons/zap-off';
	import Chart from 'lucide-svelte/icons/chart-no-axes-combined';
	import DataTable from './data-table.svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { columns } from './columns';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import InsideCountPerBuilding from '$lib/components/custom/inside_counter/insideCountPerBuilding.svelte';
	import { searchStore } from '$lib/stores/search.svelte';

	let { data, form: actionData } = $props();

	$effect(() => {
		const msg = actionData?.message;
		if (msg !== undefined) {
			if ($page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});

	let searchForm: HTMLFormElement | null = $state(null);
	let inputFocus: boolean = $state(false);
	/* eslint-disable no-undef */
	let postTimeout: NodeJS.Timeout | undefined = $state(undefined);
	let liveSearch: boolean = $state(true);

	let searchQuery = $state('');
	const persons = $derived(actionData?.persons ?? data.persons ?? []);
	const personsInside = $derived(data.personsInside ?? []);
</script>

<form
	bind:this={searchForm}
	method="POST"
	action="?/search"
	class="flex gap-2 px-4 py-2"
	onreset={() => {
		searchStore.query = '';
		goto('/');
	}}
	use:enhance={({ formData }) => {
		const input = formData.get('q');

		// Check if the input is valid
		if (input === null || input === undefined || typeof input !== 'string') {
			toast.error('Invalid search query');
		} else {
			searchStore.query = input;
		}

		return async ({ update }) => {
			await update({ reset: false });
		};
	}}
>
	<Input
		oninput={() => {
			if (!liveSearch) return;
			clearTimeout(postTimeout);
			postTimeout = setTimeout(() => searchForm?.requestSubmit(), 200);
		}}
		onfocusin={() => {
			inputFocus = true;
		}}
		onfocusout={() => {
			inputFocus = false;
		}}
		autofocus={inputFocus}
		class="max-w-xs"
		placeholder="Search..."
		name="q"
		bind:value={searchQuery}
	/>
	<Button type="submit" size="icon" class="flex-shrink-0">
		<Search />
	</Button>
	<Button type="reset" variant="destructive" size="icon" class="flex-shrink-0">
		<Reset />
	</Button>
	<Button
		onclick={() => {
			liveSearch = !liveSearch;
		}}
		variant={liveSearch ? 'secondary' : 'outline'}
		type="button"
		size="icon"
		class="flex-shrink-0"
	>
		{#if liveSearch}
			<Zap />
		{:else}
			<ZapOff />
		{/if}
	</Button>
	<Dialog.Root>
		<Dialog.Trigger
			class={`${buttonVariants({ variant: 'secondary', size: 'icon' })} flex-shrink-0`}
		>
			<Chart />
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Statistics</Dialog.Title>
			</Dialog.Header>
			<Dialog.Description>Check how many people are currently inside.</Dialog.Description>
			<div class="flex w-full">
				<InsideCountPerBuilding data={personsInside} />
			</div>
		</Dialog.Content>
	</Dialog.Root>
</form>

<Separator />
<div class="m-0 sm:m-4">
	<DataTable data={persons} {columns} />
</div>
