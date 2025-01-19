<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Search from 'lucide-svelte/icons/search';
	import Reset from 'lucide-svelte/icons/list-restart';
	import Zap from 'lucide-svelte/icons/zap';
	import ZapOff from 'lucide-svelte/icons/zap-off';
	import DataTable from './data-table.svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { columns } from './columns';
	import { enhance } from '$app/forms';
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
	$effect(() => {
		searchStore.query = searchQuery;
	});

	const persons = $derived(actionData?.persons ?? data.persons ?? []);
</script>

<form
	bind:this={searchForm}
	method="POST"
	action="?/search"
	class="flex gap-2 px-4 py-2"
	onreset={() => {
		searchQuery = '';
		searchForm?.requestSubmit();
	}}
	use:enhance={() => {
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
</form>

<Separator />
<div class="m-0 sm:m-4">
	<DataTable data={persons} {columns} />
</div>
