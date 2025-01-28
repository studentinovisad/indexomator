<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
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
	import { guarantorSearchFormSchema, searchFormSchema } from './schema';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';
	import { ArrowLeftRight, Check, ChevronsUpDown, LogIn } from 'lucide-svelte';
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
	const { form: searchFormData, enhance: searchEnhance } = searchForm;

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

	let searchQuery = $state('');
	$effect(() => {
		$searchFormData.searchQuery = searchQuery;
	});

	let inputFocus = $state(false);
	/* eslint-disable no-undef */
	let postTimeout: NodeJS.Timeout | undefined = $state(undefined);
	let liveSearch = $state(browser);

	const persons = $derived(actionData?.persons ?? data.persons);

	const guarantors = $derived(actionData?.guarantors ?? data.guarantors);
	const selectedGuarantor = $derived(
		guarantors.find((g) => g.id === guarantorDialogStore.selectedGuarantorId)
	);

	let guarantorSearchInput = $state('');
	/* eslint-disable no-undef */
	let guarantorPostTimeout: NodeJS.Timeout | undefined = $state(undefined);

	let guarantorSearchPopoverOpen = $state(false);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		guarantorSearchPopoverOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	const triggerId = useId();

	const columns = $derived(createColumns(data.userBuilding, data.toggleStateForm));
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

<Dialog.Root bind:open={guarantorDialogStore.dialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
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
						!guarantorDialogStore.selectedGuarantorId && 'text-muted-foreground'
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
					<Command.Input
						oninput={() => {
							clearTimeout(guarantorPostTimeout);
							guarantorPostTimeout = setTimeout(() => {
								guarantorSearchForm.submit();
							}, 200);
						}}
						placeholder="Search guarantor..."
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
										if (guarantorDialogStore.selectedGuarantorId === id) {
											guarantorDialogStore.selectedGuarantorId = undefined;
										} else {
											guarantorDialogStore.selectedGuarantorId = id;
										}
										closeAndFocusTrigger(triggerId);
									}}
								>
									{`${fname} ${lname} (${identifier})`}
									<Check
										class={cn(
											'ml-auto',
											id !== guarantorDialogStore.selectedGuarantorId && 'text-transparent'
										)}
									/>
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
					guarantorDialogStore.rowToggleStateForm?.submit();
				}}
				type="button"
			>
				<ArrowLeftRight />
				<span class="hidden sm:block">Confirm</span>
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

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
