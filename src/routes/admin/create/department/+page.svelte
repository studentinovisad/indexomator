<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { formSchema } from './schema';

	let { data, form: actionData } = $props();

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
			} else {
				toast.error('Please fix the errors in the form.');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" class="flex h-[90dvh] w-full items-center justify-center px-4" use:enhance>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Create department</Card.Title>
			<Card.Description>Enter the name of the new department to create.</Card.Description>
			<p class="text-rose-600 dark:text-rose-500">{actionData?.message}</p>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field {form} name="department">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Department</Form.Label>
						<Input {...props} bind:value={$formData.department} />
					{/snippet}
				</Form.Control>
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
			<Form.Button type="submit">Submit</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
