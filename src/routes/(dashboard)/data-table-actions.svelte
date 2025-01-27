<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Input } from '$lib/components/ui/input';
	import { ArrowLeftRight, Check, ChevronsUpDown, LogIn, LogOut } from 'lucide-svelte';
	import type { State } from '$lib/types/state';
	import type {
		GuarantorSearchEnhance,
		GuarantorSearchForm,
		ToggleStateEnhance,
		ToggleStateForm,
		ToggleStateFormData
	} from './schema';
	import type { Person, PersonType } from '$lib/types/person';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import { guarantorEligibilityHours } from '$lib/utils/envPublic';
	import { tick } from 'svelte';
	import { useId } from 'bits-ui';

	let {
		personId,
		personType,
		personState,
		building,
		userBuilding,
		guarantors,
		toggleStateForm,
		toggleStateFormData,
		toggleStateEnhance,
		guarantorSearchForm,
		guarantorSearchEnhance
	}: {
		personId: number;
		personType: PersonType;
		personState: State;
		building: string | null;
		userBuilding: string;
		guarantors: Person[];
		toggleStateForm: ToggleStateForm;
		toggleStateFormData: ToggleStateFormData;
		toggleStateEnhance: ToggleStateEnhance;
		guarantorSearchForm: GuarantorSearchForm;
		guarantorSearchEnhance: GuarantorSearchEnhance;
	} = $props();

	const inside = $derived(personState === 'Inside');
	const sameBuilding = $derived(userBuilding === building);

	const selectedGuarantor = $derived(
		guarantors.find((g) => g.id === $toggleStateFormData.guarantorId)
	);

	let guarantorSearchInput = $state('');
	/* eslint-disable no-undef */
	let postTimeout: NodeJS.Timeout | undefined = $state(undefined);

	let open = $state(false);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	const triggerId = useId();
</script>

<form method="POST" action="?/togglestate" class="w-full" use:toggleStateEnhance>
	<Form.Field class="hidden" form={toggleStateForm} name="personId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={personId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	{#if personType !== 'Guest'}
		<Form.Button variant="outline" class="w-full">
			{#if inside}
				{#if sameBuilding}
					<LogOut />
					<span class="hidden sm:block">Release</span>
				{:else}
					<ArrowLeftRight />
					<span class="hidden sm:block">Transfer</span>
				{/if}
			{:else}
				<LogIn />
				<span class="hidden sm:block">Admit</span>
			{/if}
		</Form.Button>
	{:else if inside && sameBuilding}
		<Form.Button variant="outline" class="w-full">
			<LogOut />
			<span class="hidden sm:block">Release</span>
		</Form.Button>
	{:else}
		<Dialog.Root>
			<Dialog.Trigger type="button" class={cn('w-full', buttonVariants({ variant: 'outline' }))}>
				{#if inside}
					<ArrowLeftRight />
					<span class="hidden sm:block">Transfer</span>
				{:else}
					<LogIn />
					<span class="hidden sm:block">Admit</span>
				{/if}
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-[425px]">
				<Dialog.Header>
					<Dialog.Title>Select guarantor</Dialog.Title>
					<Dialog.Description>
						Search for a guarantor that is eligible (has at least {guarantorEligibilityHours}h)
					</Dialog.Description>
				</Dialog.Header>
				<Form.Field form={toggleStateForm} name="guarantorId">
					<Popover.Root bind:open>
						<Form.Control id={triggerId}>
							{#snippet children({ props })}
								<div class="grid space-y-3">
									<Form.Label>Guarantor</Form.Label>
									<Popover.Trigger
										class={cn(
											buttonVariants({ variant: 'outline' }),
											'justify-between',
											!$toggleStateFormData.guarantorId && 'text-muted-foreground'
										)}
										role="combobox"
										{...props}
									>
										{selectedGuarantor
											? `${selectedGuarantor.fname} ${selectedGuarantor.lname} (${selectedGuarantor.identifier})`
											: 'Select guarantor'}
										<ChevronsUpDown class="opacity-50" />
									</Popover.Trigger>
									<input hidden value={$toggleStateFormData.guarantorId} name={props.name} />
								</div>
							{/snippet}
						</Form.Control>
						<Popover.Content>
							<Command.Root shouldFilter={false}>
								<Command.Input
									oninput={() => {
										clearTimeout(postTimeout);
										postTimeout = setTimeout(() => guarantorSearchForm.submit(), 200);
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
													if ($toggleStateFormData.guarantorId === id) {
														$toggleStateFormData.guarantorId = undefined;
													} else {
														$toggleStateFormData.guarantorId = id;
													}
													closeAndFocusTrigger(triggerId);
												}}
											>
												{`${fname} ${lname} (${identifier})`}
												<Check
													class={cn(
														'ml-auto',
														id !== $toggleStateFormData.guarantorId && 'text-transparent'
													)}
												/>
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
					<Form.FieldErrors />
				</Form.Field>
				<Dialog.Footer>
					<Button type="button">
						{#if inside}
							<ArrowLeftRight />
							<span class="hidden sm:block">Transfer</span>
						{:else}
							<LogIn />
							<span class="hidden sm:block">Admit</span>
						{/if}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
</form>

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
