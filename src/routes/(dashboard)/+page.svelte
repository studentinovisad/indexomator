<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import CommandInput from '$lib/components/custom/command/command-input.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { guarantorEligibilityHours } from '$lib/utils/envPublic';
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
	import { guarantorSearchFormSchema, searchFormSchema, toggleStateFormSchema } from './schema';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';
	import { Check, CheckCheck, ChevronsUpDown } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { useId } from 'bits-ui';
	import Label from '$lib/components/ui/label/label.svelte';
	import { guarantorDialogStore } from '$lib/stores/guarantorDialog.svelte';

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
	const { enhance: searchEnhance } = searchForm;

	/* eslint-disable no-undef */
	let searchPostTimeout: NodeJS.Timeout | undefined = $state(undefined);
	let searchInput = $state('');
	let searchInputFocus = $state(false);
	let liveSearch = $state(browser);
	const persons = $derived(actionData?.persons ?? data.persons);

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

	/* eslint-disable no-undef */
	let guarantorSearchPostTimeout: NodeJS.Timeout | undefined = $state(undefined);
	let guarantorSearchInput = $state('');
	let guarantorSearchPopoverOpen = $state(false);
	const guarantors = $derived(actionData?.guarantors ?? data.guarantors);

	let selectedGuarantorId: number | undefined = $state(undefined);
	const selectedGuarantor = $derived(guarantors.find((g) => g.id === selectedGuarantorId));

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
	const { enhance: toggleStateEnhance, submit: toggleStateFormSubmit } = toggleStateForm;
	const columns = $derived(createColumns(data.userBuilding, toggleStateFormSubmit));

	const triggerId = useId();
</script>

<!-- Search for persons -->
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
						clearTimeout(searchPostTimeout);
						searchPostTimeout = setTimeout(() => searchForm.submit(), 200);
					}}
					onfocusin={() => {
						searchInputFocus = true;
					}}
					onfocusout={() => {
						searchInputFocus = false;
					}}
					autofocus={searchInputFocus}
					class="max-w-xs"
					placeholder="Search..."
					bind:value={searchInput}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button size="icon" class="flex-shrink-0">
		<Search />
	</Form.Button>
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger
				type="reset"
				class={cn('flex-shrink-0', buttonVariants({ variant: 'destructive', size: 'icon' }))}
			>
				<Reset />
			</Tooltip.Trigger>
			<Tooltip.Content>
				<span>Clear the search query</span>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
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

<!-- Data table for persons -->
<Separator />
<div class="m-0 sm:m-4">
	<DataTable data={persons} {columns} />
</div>

<!-- Dialog for searching guarantors when admiting/tranfering guests -->
<Dialog.Root bind:open={guarantorDialogStore.dialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Select guarantor</Dialog.Title>
			<Dialog.Description>
				Search for a guarantor that is eligible (has at least {guarantorEligibilityHours}h)
			</Dialog.Description>
		</Dialog.Header>
		<Popover.Root bind:open={guarantorSearchPopoverOpen}>
			<div id={triggerId} class="grid space-y-3">
				<Label>Guarantor</Label>
				<Popover.Trigger
					class={cn(
						buttonVariants({ variant: 'outline' }),
						'justify-between',
						!selectedGuarantorId && 'text-muted-foreground'
					)}
					role="combobox"
				>
					{selectedGuarantor
						? `${selectedGuarantor.fname} ${selectedGuarantor.lname} (${selectedGuarantor.identifier})`
						: 'Select guarantor'}
					<ChevronsUpDown class="opacity-50" />
				</Popover.Trigger>
			</div>
			<Popover.Content>
				<Command.Root shouldFilter={false}>
					<CommandInput
						oninput={() => {
							clearTimeout(guarantorSearchPostTimeout);
							guarantorSearchPostTimeout = setTimeout(() => {
								guarantorSearchForm.submit();
							}, 200);
						}}
						placeholder="Search guarantors..."
						class="h-9"
						bind:value={guarantorSearchInput}
					/>
					<Command.List>
						<Command.Empty>No guarantors found.</Command.Empty>
						<Command.Group>
							{#each guarantors as { id, fname, lname, identifier } (id)}
								<Command.Item
									value={`${id}`}
									onSelect={() => {
										if (selectedGuarantorId === id) {
											selectedGuarantorId = undefined;
										} else {
											selectedGuarantorId = id;
										}

										// We want to refocus the trigger button when the user selects
										// an item from the list so users can continue navigating the
										// rest of the form with the keyboard.
										guarantorSearchPopoverOpen = false;
										tick().then(() => {
											document.getElementById(triggerId)?.focus();
										});
									}}
								>
									{`${fname} ${lname} (${identifier})`}
									<Check class={cn('ml-auto', id !== selectedGuarantorId && 'text-transparent')} />
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
		<Dialog.Footer>
			<Button
				onclick={() => {
					guarantorDialogStore.dialogOpen = false;
					guarantorDialogStore.guarantorId = selectedGuarantorId;
					tick().then(() => toggleStateForm.submit());
				}}
				type="button"
			>
				<CheckCheck />
				<span>Confirm</span>
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Hidden form used to POST action for searching guarantors -->
<form method="POST" action="?/guarantorSearch" use:guarantorSearchEnhance>
	<Form.Field class="hidden" form={guarantorSearchForm} name="guarantorSearchQuery">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={guarantorSearchInput} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>

<!-- Hidden form used to POST action for toggling person state -->
<form method="POST" action="?/togglestate" use:toggleStateEnhance>
	<Form.Field class="hidden" form={toggleStateForm} name="personId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={guarantorDialogStore.personId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field class="hidden" form={toggleStateForm} name="guarantorId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={guarantorDialogStore.guarantorId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>
