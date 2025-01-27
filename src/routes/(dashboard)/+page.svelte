<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
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
	import { searchFormSchema, toggleStateFormSchema, guarantorSearchFormSchema } from './schema';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';

	let { data, form: actionData } = $props();

	const searchForm = superForm(data.searchForm, {
		invalidateAll: false,
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
	const { form: toggleStateFormData, enhance: toggleStateEnhance } = toggleStateForm;

	const guarantorSearchForm = superForm(data.guarantorSearchForm, {
		invalidateAll: false,
		resetForm: false,
		validators: zodClient(guarantorSearchFormSchema),
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
	const { enhance: guarantorSearchEnhance } = guarantorSearchForm;

	const guarantors = $derived(actionData?.guarantors ?? data.guarantors);
	const columns = $derived(
		createColumns(
			data.userBuilding,
			guarantors,
			toggleStateForm,
			toggleStateFormData,
			toggleStateEnhance,
			guarantorSearchForm,
			guarantorSearchEnhance
		)
	);

	let searchQuery = $state('');
	$effect(() => {
		$searchFormData.searchQuery = searchQuery;
	});

	let inputFocus = $state(false);
	/* eslint-disable no-undef */
	let postTimeout: NodeJS.Timeout | undefined = $state(undefined);
	let liveSearch = $state(browser);

	const persons = $derived(actionData?.persons ?? data.persons);
</script>

<form
	method="POST"
	action="?/search"
	class="flex gap-2 px-4 py-2"
	onreset={() => {
		searchForm.submit();
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
						postTimeout = setTimeout(() => searchForm.submit(), 200);
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
					bind:value={searchQuery}
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
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger
				onclick={() => {
					liveSearch = !liveSearch;
				}}
				class={cn(
					'flex-shrink-0',
					buttonVariants({ variant: liveSearch ? 'secondary' : 'outline', size: 'icon' })
				)}
			>
				{#if liveSearch}
					<Zap />
				{:else}
					<ZapOff />
				{/if}
			</Tooltip.Trigger>
			<Tooltip.Content>
				<span>{liveSearch ? 'Disable' : 'Enable'} live search</span>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
</form>

<Separator />
<div class="m-0 sm:m-4">
	<DataTable data={persons} {columns} />
</div>
