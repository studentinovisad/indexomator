<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { tick } from 'svelte';
	import { useId } from 'bits-ui';
	import { createFormSchema, guarantorSearchFormSchema } from './schema.js';

	let { data, form: actionData } = $props();

	const createForm = superForm(data.createForm, {
		validators: zodClient(createFormSchema),
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
	const { form: createFormData, enhance: createFormEnhance } = createForm;

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
	const { enhance: guarantorSearchFormEnhance } = guarantorSearchForm;

	const guarantors = $derived(actionData?.guarantors ?? data.guarantors);
	const selectedGuarantor = $derived(guarantors.find((g) => g.id === $createFormData.guarantorId));

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

<form
	method="POST"
	action="?/create"
	class="flex h-[90dvh] w-full items-center justify-center px-4"
	use:createFormEnhance
>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Create guest</Card.Title>
			<Card.Description>
				Create a guest who wants to enter the building for the first time.
			</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field form={createForm} name="fname">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>First name</Form.Label>
						<Input {...props} bind:value={$createFormData.fname} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field form={createForm} name="lname">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Last name</Form.Label>
						<Input {...props} bind:value={$createFormData.lname} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field form={createForm} name="identifier">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Index / Email / Last 4 digits from ID</Form.Label>
						<Input {...props} bind:value={$createFormData.identifier} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field form={createForm} name="university">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>University</Form.Label>
						<Select.Root type="single" bind:value={$createFormData.university} name={props.name}>
							<Select.Trigger {...props}>
								{$createFormData.university ?? 'Select the university for the guest'}
							</Select.Trigger>
							<Select.Content>
								{#each data.universities as { id, name } (id)}
									<Select.Item value={name} label={name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field form={createForm} name="guarantorId">
				<Popover.Root bind:open>
					<Form.Control id={triggerId}>
						{#snippet children({ props })}
							<div class="grid space-y-3">
								<Form.Label>Guarantor</Form.Label>
								<Popover.Trigger
									class={cn(
										buttonVariants({ variant: 'outline' }),
										'justify-between',
										!$createFormData.guarantorId && 'text-muted-foreground'
									)}
									role="combobox"
									{...props}
								>
									{selectedGuarantor
										? `${selectedGuarantor.fname} ${selectedGuarantor.lname} (${selectedGuarantor.identifier})`
										: 'Select guarantor'}
									<ChevronsUpDown class="opacity-50" />
								</Popover.Trigger>
								<input hidden value={$createFormData.guarantorId} name={props.name} />
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
												if ($createFormData.guarantorId === id) {
													$createFormData.guarantorId = undefined;
												} else {
													$createFormData.guarantorId = id;
												}
												closeAndFocusTrigger(triggerId);
											}}
										>
											{`${fname} ${lname} (${identifier})`}
											<Check
												class={cn(
													'ml-auto',
													id !== $createFormData.guarantorId && 'text-transparent'
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
			<Form.Button>Submit</Form.Button>
		</Card.Content>
	</Card.Root>
</form>

<form method="POST" action="?/guarantorSearch" use:guarantorSearchFormEnhance>
	<Form.Field class="hidden" form={guarantorSearchForm} name="guarantorSearchQuery">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={guarantorSearchInput} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>
