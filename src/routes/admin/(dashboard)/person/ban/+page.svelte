<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { banFormSchema, searchFormSchema } from './schema.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { tick } from 'svelte';
	import { useId } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import CommandInput from '$lib/components/custom/command/command-input.svelte';

	let { data, form: actionData } = $props();

	const banForm = superForm(data.banForm, {
		validators: zodClient(banFormSchema),
		onUpdated: ({ form: f }) => {
			if (actionData?.message === undefined) return;
			const msg = actionData.message;
			if (f.valid && page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});
	const { form: banFormData, enhance: banFormEnhance } = banForm;

	const searchForm = superForm(data.searchForm, {
		validators: zodClient(searchFormSchema),
		onUpdated: ({ form: f }) => {
			if (actionData?.message === undefined) return;
			const msg = actionData.message;
			if (f.valid && page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});
	const { enhance: searchFormEnhance } = searchForm;

	const persons = $derived(actionData?.persons ?? data.persons);
	const selectedPerson = $derived(persons.find((p) => p.id === $banFormData.personId));

	let searchInput = $state('');
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

<div class="flex w-full items-center justify-center px-4 pt-[5dvh] sm:pt-[10dvh]">
	<form method="POST" action="?/ban" use:banFormEnhance>
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-2xl">Ban / Pardon person</Card.Title>
				<Card.Description>Select the person you want to ban or pardon.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<Form.Field form={banForm} name="personId">
					<Popover.Root bind:open>
						<Form.Control id={triggerId}>
							{#snippet children({ props })}
								{@const label = selectedPerson
									? selectedPerson.university
										? `${selectedPerson.fname} ${selectedPerson.lname} (${selectedPerson.identifier}) - ${selectedPerson.university}`
										: `${selectedPerson.fname} ${selectedPerson.lname} (${selectedPerson.identifier})`
									: 'Select person'}
								<div class="grid space-y-3">
									<Form.Label>Person</Form.Label>
									<Popover.Trigger
										class={cn(
											buttonVariants({ variant: 'outline' }),
											'justify-between',
											!$banFormData.personId && 'text-muted-foreground'
										)}
										role="combobox"
										{...props}
									>
										{label}
										<ChevronsUpDown class="opacity-50" />
									</Popover.Trigger>
									<input hidden value={$banFormData.personId} name={props.name} />
								</div>
							{/snippet}
						</Form.Control>
						<Popover.Content>
							<Command.Root shouldFilter={false}>
								<CommandInput
									oninput={() => {
										clearTimeout(postTimeout);
										postTimeout = setTimeout(() => searchForm.submit(), 200);
									}}
									placeholder="Search person..."
									class="h-9"
									bind:value={searchInput}
								/>
								<Command.List>
									<Command.Empty>No person found.</Command.Empty>
									<Command.Group>
										{#each persons as { id, fname, lname, identifier, university } (id)}
											{@const label = university
												? `${fname} ${lname} (${identifier}) - ${university}`
												: `${fname} ${lname} (${identifier})`}
											<Command.Item
												value={`${id}`}
												onSelect={() => {
													if ($banFormData.personId === id) {
														$banFormData.personId = undefined!;
													} else {
														$banFormData.personId = id;
													}
													closeAndFocusTrigger(triggerId);
												}}
											>
												{label}
												<Check
													class={cn('ml-auto', id !== $banFormData.personId && 'text-transparent')}
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
				<Form.Field form={banForm} name="action" class="mx-auto">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Button {...props} value="ban" variant="destructive">Ban</Form.Button>
							<Form.Button {...props} value="pardon" variant="default">Pardon</Form.Button>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</Card.Content>
		</Card.Root>
	</form>
</div>

<form method="POST" action="?/search" use:searchFormEnhance>
	<Form.Field class="hidden" form={searchForm} name="searchQuery">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={searchInput} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>
