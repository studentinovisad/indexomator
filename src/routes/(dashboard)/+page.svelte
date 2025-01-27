<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Search from 'lucide-svelte/icons/search';
	import Reset from 'lucide-svelte/icons/list-restart';
	import Zap from 'lucide-svelte/icons/zap';
	import ZapOff from 'lucide-svelte/icons/zap-off';
	import DataTable from './data-table.svelte';
	import { createColumns } from './columns';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { searchFormSchema, toggleStateFormSchema } from './schema';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { data, form: actionData } = $props();

	const searchForm = superForm(data.searchForm, {
		resetForm: false,
		validators: zodClient(searchFormSchema),
		onUpdated: ({ form: f }) => {
			if (actionData?.message === undefined) return;
			const msg = actionData.message;
			if (f.valid && $page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});
	const { form: searchFormData, enhance: searchEnhance } = searchForm;

	const toggleStateForm = superForm(data.toggleStateForm, {
		validators: zodClient(toggleStateFormSchema),
		onUpdated: ({ form: f }) => {
			if (actionData?.message === undefined) return;
			const msg = actionData.message;
			if (f.valid && $page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});
	const { enhance: toggleStateEnhance } = toggleStateForm;
	const columns = createColumns(data.userBuilding, toggleStateForm, toggleStateEnhance);

	let searchFormElement: HTMLFormElement | null = $state(null);
	let inputFocus: boolean = $state(false);
	/* eslint-disable no-undef */
	let postTimeout: NodeJS.Timeout | undefined = $state(undefined);
	let liveSearch: boolean = $state(browser);

	const persons = $derived(actionData?.persons ?? data.persons);
</script>

<form
	bind:this={searchFormElement}
	method="POST"
	action="?/search"
	class="flex gap-2 px-4 py-2"
	onreset={() => {
		searchFormElement?.requestSubmit();
	}}
	use:searchEnhance
>
	<Form.Field form={searchForm} name="searchQuery">
		<Form.Control>
			{#snippet children({ props })}
				<Input
					{...props}
					oninput={() => {
						if (!liveSearch) return;
						clearTimeout(postTimeout);
						postTimeout = setTimeout(() => searchFormElement?.requestSubmit(), 200);
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
					bind:value={$searchFormData.searchQuery}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button size="icon" class="flex-shrink-0">
		<Search />
	</Form.Button>
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
