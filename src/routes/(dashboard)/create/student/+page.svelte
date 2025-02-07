<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { createFormSchema } from './schema';
	import { page } from '$app/state';
	import { rectorateMode } from '$lib/utils/env';

	let { data, form: actionData } = $props();

	const createForm = superForm(data.createForm, {
		validators: zodClient(createFormSchema),
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
	const { form: createFormData, enhance: createFormEnhance } = createForm;
</script>

<form
	method="POST"
	class="flex h-[90dvh] w-full items-center justify-center px-4"
	use:createFormEnhance
>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Create student</Card.Title>
			<Card.Description>
				Create a student who wants to enter the building for the first time.
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
						<Form.Label>Index</Form.Label>
						<Input {...props} bind:value={$createFormData.identifier} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			{#if rectorateMode}
				<Form.Field form={createForm} name="university">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>University</Form.Label>
							<Select.Root type="single" bind:value={$createFormData.university} name={props.name}>
								<Select.Trigger {...props}>
									{$createFormData.university ?? 'Select the university for the student'}
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
			{:else}
				<Form.Field form={createForm} name="department">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Department</Form.Label>
							<Select.Root type="single" bind:value={$createFormData.department} name={props.name}>
								<Select.Trigger {...props}>
									{$createFormData.department ?? 'Select the department for the student'}
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
			{/if}
			<Form.Button>Submit</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
