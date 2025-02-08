<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
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
			<Card.Title class="text-2xl">Set user schedule</Card.Title>
			<Card.Description>Set the time interval when the user
			can log in.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field {form} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Username</Form.Label>
						<Input {...props} bind:value={$formData.username} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="schedStart">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Start</Form.Label>
						<div class="flex gap-2">
							<Input type="text" {...props} bind:value={$formData.schedStart} />
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="schedEnd">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>End</Form.Label>
						<div class="flex gap-2">
							<Input type="text" {...props} bind:value={$formData.schedEnd} />
						</div>
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
			<Form.Button>Submit</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
