<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { formSchema } from './schema';
	import { page } from '$app/state';

	let { data, form: actionData } = $props();

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
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

	const { form: formData, enhance } = form;
</script>

<form method="POST" class="flex h-[90dvh] w-full items-center justify-center px-4" use:enhance>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Create university</Card.Title>
			<Card.Description>Enter the name of the new university to create.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field {form} name="university">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>University</Form.Label>
						<Input {...props} bind:value={$formData.university} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button type="submit">Submit</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
