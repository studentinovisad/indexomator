<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import AtSign from 'lucide-svelte/icons/at-sign';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { createFormSchema } from './schema';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { removeDiacritics } from '$lib/utils/sanitize';

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

	function constructEmail(): string {
		const fname = removeDiacritics($createFormData.fname).toLowerCase();
		const lname = removeDiacritics($createFormData.lname).toLowerCase();
		const department = $createFormData.department
			? removeDiacritics($createFormData.department).toLowerCase()
			: 'none';

		return `${fname}.${lname}@${department}.uns.ac.rs`;
	}
</script>

<form
	method="POST"
	class="flex h-[90dvh] w-full items-center justify-center px-4"
	use:createFormEnhance
>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Create employee</Card.Title>
			<Card.Description>
				Create an employee who wants to enter the building for the first time.
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
						<Form.Label>Email / Last 4 digits from ID</Form.Label>
						<div class="flex gap-2">
							<Input {...props} bind:value={$createFormData.identifier} />
							<Button
								type="button"
								onclick={() => {
									if (
										$createFormData.fname !== '' &&
										$createFormData.lname !== '' &&
										$createFormData.department !== ''
									) {
										$createFormData.identifier = constructEmail();
									} else if ($createFormData.fname === '') {
										toast.error('You have to fill out the "First Name" field.');
									} else if ($createFormData.lname === '') {
										toast.error('You have to fill out the "Last Name" field.');
									} else if ($createFormData.department === '') {
										toast.error('You have to fill out the "Department" field.');
									}
								}}
								data-sidebar="trigger"
								variant="outline"
								size="icon"
							>
								<AtSign />
								<span class="sr-only">Generate Email</span>
							</Button>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field form={createForm} name="department">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Department</Form.Label>
						<Select.Root type="single" bind:value={$createFormData.department} name={props.name}>
							<Select.Trigger {...props}>
								{$createFormData.department ?? 'Select the department for the employee'}
							</Select.Trigger>
							<Select.Content>
								{#each data.departments as { id, name } (id)}
									<Select.Item value={name} label={name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Submit</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
