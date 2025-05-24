<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import CommandInput from '$lib/components/custom/command/command-input.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { guarantorEligibilityHours } from '$lib/utils/env';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Search from 'lucide-svelte/icons/search';
	import Reset from 'lucide-svelte/icons/list-restart';
	import Zap from 'lucide-svelte/icons/zap';
	import ZapOff from 'lucide-svelte/icons/zap-off';
	import DataTable from './data-table.svelte';
	import DataTableGuests from './data-table-guests.svelte';
	import { createColumns, createColumnsGuests } from './columns';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import {
		guarantorSearchFormSchema,
		searchFormSchema,
		showGuestsFormSchema,
		toggleGuestStateFormSchema,
		toggleStateFormSchema
	} from './schema';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';
	import { Check, CheckCheck, ChevronsUpDown } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { useId } from 'bits-ui';
	import Label from '$lib/components/ui/label/label.svelte';
	import { toggleStateFormStore } from '$lib/stores/toggleState.svelte';
	import type { Guest } from '$lib/types/person';
	import { showGuestsFormStore } from '$lib/stores/showGuests.svelte';
	import successSFX from '$lib/assets/sfx/success.mp3';
	import warningSFX from '$lib/assets/sfx/warning.mp3';
	import errorSFX from '$lib/assets/sfx/error.mp3';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import CardList from '$lib/components/ui/card-list/card-list.svelte';

	let { data, form: actionData } = $props();

	let persons = $state(data.persons);
	const searchForm = superForm(data.searchForm, {
		invalidateAll: false,
		resetForm: false,
		validators: zodClient(searchFormSchema),
		onUpdated: ({ form: f }) => {
			if (actionData?.persons) persons = actionData?.persons;
			if (actionData?.message === undefined) return;
			const msg = actionData.message;
			if (f.valid && page.status === 200) {
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

	let guarantors = $state(data.guarantors);
	const guarantorSearchForm = superForm(data.guarantorSearchForm, {
		invalidateAll: false,
		resetForm: false,
		validators: zodClient(guarantorSearchFormSchema),
		onUpdated: ({ form: f }) => {
			if (actionData?.guarantors) guarantors = actionData?.guarantors;
			const msg = actionData?.message;
			if (f.valid && page.status === 200) {
				if (msg) toast.success(msg);
			} else {
				if (msg) toast.error(msg);
			}
		}
	});
	const { enhance: guarantorSearchEnhance } = guarantorSearchForm;

	/* eslint-disable no-undef */
	let guarantorSearchPostTimeout: NodeJS.Timeout | undefined = $state(undefined);
	let guarantorSearchInput = $state('');
	let guarantorSearchPopoverOpen = $state(false);

	let selectedGuarantorId: number | undefined = $state(undefined);
	const selectedGuarantor = $derived(guarantors.find((g) => g.id === selectedGuarantorId));

	const toggleStateForm = superForm(data.toggleStateForm, {
		validators: zodClient(toggleStateFormSchema),
		onUpdated: ({ form: f }) => {
			const msg = actionData?.message;
			if (f.valid && page.status === 200) {
				resetSearchAndGuarantorSearch();
				if (msg) {
					if (!actionData?.warning) {
						toast.success(msg);
						new Audio(successSFX).play();
					} else {
						toast.warning(msg);
						new Audio(warningSFX).play();
					}
				}
			} else {
				if (msg) toast.error(msg);
				new Audio(errorSFX).play();
			}
		}
	});
	const { enhance: toggleStateEnhance, submit: toggleStateFormSubmit } = toggleStateForm;

	const toggleGuestStateForm = superForm(data.toggleGuestStateForm, {
		validators: zodClient(toggleGuestStateFormSchema),
		onUpdated: ({ form: f }) => {
			const msg = actionData?.message;
			if (f.valid && page.status === 200) {
				resetSearchAndGuarantorSearch();
				if (msg) toast.success(msg);
				new Audio(successSFX).play();
			} else {
				if (msg) toast.error(msg);
				new Audio(errorSFX).play();
			}
		}
	});
	const { enhance: toggleGuestStateEnhance, submit: toggleGuestStateFormSubmit } =
		toggleGuestStateForm;

	let insideGuests: Guest[] = $state([]);
	const showGuestsForm = superForm(data.showGuestsForm, {
		validators: zodClient(showGuestsFormSchema),
		onUpdated: ({ form: f }) => {
			if (actionData?.insideGuests) insideGuests = actionData?.insideGuests;
			if (actionData?.message === undefined) return;
			const msg = actionData.message;
			if (f.valid && page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});
	const { enhance: showGuestsEnhance, submit: showGuestsFormSubmit } = showGuestsForm;

	function resetSearchAndGuarantorSearch() {
		searchInput = '';
		persons = data.persons;
		guarantorSearchInput = '';
		guarantors = data.guarantors;
	}

	const columns = $derived(
		createColumns(
			data.userBuilding,
			toggleStateFormSubmit,
			toggleGuestStateFormSubmit,
			showGuestsFormSubmit
		)
	);
	const columnsGuests = $derived(createColumnsGuests());

	const triggerId = useId();
	const isMobile = new IsMobile();
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
<div class="m-0">
	{#if isMobile.current}
		<CardList
			data={persons}
			userBuilding={data.userBuilding}
			{toggleGuestStateFormSubmit}
			{toggleStateFormSubmit}
			{showGuestsFormSubmit}
		/>
	{:else}
		<DataTable data={persons} {columns} />
	{/if}
</div>

<!-- Dialog for searching guarantors when admiting/tranfering guests -->
<Dialog.Root bind:open={toggleStateFormStore.dialogOpen}>
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
					toggleStateFormStore.dialogOpen = false;
					tick().then(() => toggleGuestStateForm.submit());
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
<form method="POST" action="?/toggleState" use:toggleStateEnhance>
	<Form.Field class="hidden" form={toggleStateForm} name="personId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={toggleStateFormStore.personId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field class="hidden" form={toggleStateForm} name="action">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={toggleStateFormStore.action} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>

<!-- Hidden form used to POST action for toggling guest state -->
<form method="POST" action="?/toggleGuestState" use:toggleGuestStateEnhance>
	<Form.Field class="hidden" form={toggleGuestStateForm} name="personId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={toggleStateFormStore.personId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field class="hidden" form={toggleGuestStateForm} name="guarantorId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={selectedGuarantorId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field class="hidden" form={toggleStateForm} name="action">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={toggleStateFormStore.action} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>

<!-- Hidden form used to POST action for showing guests -->
<form method="POST" action="?/showGuests" use:showGuestsEnhance>
	<Form.Field class="hidden" form={showGuestsForm} name="guarantorId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={showGuestsFormStore.guarantorId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>

<!-- Dialog for showing table of inside guests -->
<Dialog.Root bind:open={showGuestsFormStore.dialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Inside guests</Dialog.Title>
		</Dialog.Header>
		<DataTableGuests data={insideGuests} columns={columnsGuests} />
		<Dialog.Footer>
			<!-- TODO: Exit all guests, exit particular guest
			<Button type="button">
				<CheckCheck />
				<span>Confirm</span>
			</Button>
			-->
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
