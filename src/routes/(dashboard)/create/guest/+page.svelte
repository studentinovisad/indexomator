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
	import { formSchema } from './schema';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { tick } from 'svelte';
	import { useId } from 'bits-ui';
	import { enhance } from '$app/forms';

	let { data, form: actionData } = $props();

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
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

	const { form: formData, enhance: enhanceF } = form;

	const persons = $derived(actionData?.persons ?? data.persons);
	const selectedPerson = $derived(persons.find((p) => p.id === $formData.guarantorId));

	let searchForm: HTMLFormElement | null = $state(null);
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

<form
	bind:this={searchForm}
	action="?/search"
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			await update({ reset: false });
		};
	}}
>
	<input type="hidden" value={searchInput} name="q" />
</form>

<form
	action="?/create"
	method="POST"
	class="flex h-[90dvh] w-full items-center justify-center px-4"
	use:enhanceF
>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Create guest</Card.Title>
			<Card.Description>
				Create a guest who wants to enter the building for the first time.
			</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field {form} name="fname">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>First name</Form.Label>
						<Input {...props} bind:value={$formData.fname} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="lname">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Last name</Form.Label>
						<Input {...props} bind:value={$formData.lname} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="identifier">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Index / Email / Last 4 digits from ID</Form.Label>
						<Input {...props} bind:value={$formData.identifier} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="university">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>University</Form.Label>
						<Select.Root type="single" bind:value={$formData.university} name={props.name}>
							<Select.Trigger {...props}>
								{$formData.university ?? 'Select the university for the guest'}
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
			<Form.Field {form} name="guarantorId">
				<Popover.Root bind:open>
					<Form.Control id={triggerId}>
						{#snippet children({ props })}
							<div class="grid space-y-3">
								<Form.Label>Guarantor</Form.Label>
								<Popover.Trigger
									class={cn(
										buttonVariants({ variant: 'outline' }),
										'justify-between',
										!$formData.guarantorId && 'text-muted-foreground'
									)}
									role="combobox"
									{...props}
								>
									{selectedPerson
										? `${selectedPerson.fname} ${selectedPerson.lname} ${selectedPerson.identifier}`
										: 'Select guarantor'}
									<ChevronsUpDown class="opacity-50" />
								</Popover.Trigger>
								<input hidden value={$formData.guarantorId} name={props.name} />
							</div>
						{/snippet}
					</Form.Control>
					<Popover.Content>
						<Command.Root shouldFilter={false}>
							<Command.Input
								oninput={() => {
									clearTimeout(postTimeout);
									postTimeout = setTimeout(() => searchForm?.requestSubmit(), 200);
								}}
								placeholder="Search guarantor..."
								class="h-9"
								bind:value={searchInput}
							/>
							<Command.List>
								<Command.Group>
									{#each persons as { id, fname, lname, identifier } (id)}
										{@const label = `${fname} ${lname} ${identifier}`}
										<Command.Item
											value={label}
											onSelect={() => {
												if ($formData.guarantorId === id) {
													$formData.guarantorId = undefined;
												} else {
													$formData.guarantorId = id;
													closeAndFocusTrigger(triggerId);
												}
											}}
										>
											{label}
											<Check
												class={cn('ml-auto', id !== $formData.guarantorId && 'text-transparent')}
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
			<Form.Button type="submit">Submit</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
