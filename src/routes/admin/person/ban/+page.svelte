<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { formSchema } from './schema';
	import { page } from '$app/state';
	import { useId } from 'bits-ui';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import CommandInput from '$lib/components/custom/command/command-input.svelte';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { personSearchFormSchema } from './schema.js';

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

	const { form: formData, enhance } = form;
	const guarantorSearchForm = superForm(data.guarantorSearchForm, {
		invalidateAll: false,
		resetForm: false,
		validators: zodClient(personSearchFormSchema),
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
	const { enhance: guarantorSearchFormEnhance } = guarantorSearchForm;

	const guarantors = $derived(actionData?.guarantors ?? data.guarantors);
	const selectedGuarantor = $derived(guarantors.find((g) => g.id === $createFormData.guarantorId));

let guarantorSearchInput = $state('');

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	const triggerId = useId();
	let open = $state(false);
</script>

<form method="POST" class="flex h-[90dvh] w-full items-center justify-center px-4" use:enhance>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Ban Student</Card.Title>
			<Card.Description>Ban a student from the system.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
		<Form.Field form={form} name="personId">
			<Popover.Root bind:open>
				<Form.Control id={triggerId}>
					{#snippet children({ props })}
						<div class="grid space-y-3">
							<Form.Label>Guarantor</Form.Label>
							<Popover.Trigger
								class={cn(
									buttonVariants({ variant: 'outline' }),
									'justify-between',
									!$formData.personId && 'text-muted-foreground'
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
						<CommandInput
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
											if ($formData.personId === id) {
												$formData.personId = undefined;
											} else {
												$formData.personId = id;
											}
											closeAndFocusTrigger(triggerId);
										}}
									>
										{`${fname} ${lname} (${identifier})`}
										<Check
											class={cn(
												'ml-auto',
												id !== $formData.personId && 'text-transparent'
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
			<Form.Field {form} name="secret">
				<Form.Control>
					{#snippet children({ props })} 
						<Form.Label>Secret</Form.Label>
						<Input type="password" {...props} bind:value={$formData.secret} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button variant="destructive">🚫 BAN STUDENT 🚫</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
