<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { formSchema } from './schema';
	import { page } from '$app/stores';

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
</script>

<form method="POST" class="flex h-[90dvh] w-full items-center justify-center px-4" use:enhance>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Nuke building</Card.Title>
			<Card.Description>Mark all the people in the building as outside.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field {form} name="building">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Building</Form.Label>
						<Select.Root type="single" bind:value={$formData.building} name={props.name}>
							<Select.Trigger {...props}>
								{$formData.building ?? 'Select Building'}
							</Select.Trigger>
							<Select.Content>
								{#each data.buildings as building (building.id)}
									<Select.Item value={building.name} label={building.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="personType">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Person Type</Form.Label>
						<Select.Root type="single" bind:value={$formData.personType} name={props.name}>
							<Select.Trigger {...props}>
								{$formData.personType ?? 'Select Person Type'}
							</Select.Trigger>
							<Select.Content>
								{#each data.personTypes as personType}
									<Select.Item value={personType} label={personType} />
								{/each}
							</Select.Content>
						</Select.Root>
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
			<Form.Button variant="destructive">☢️ NUKE BUILDING ☢️</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
