<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { formSchema } from './schema';
	import LogoLight from '$lib/assets/images/light.svg';
	import LogoDark from '$lib/assets/images/dark.svg';

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

<div class="flex h-screen w-full items-center justify-center px-4">
	<form method="POST" class="flex w-full items-center justify-center px-4 pt-4" use:enhance>
		<Card.Root class="mx-auto w-full max-w-sm">
			<Card.Header>
				<img class="ml-auto hidden size-20 dark:block" src={LogoLight} alt="Logo light" />
				<img class="ml-auto block size-20 dark:hidden" src={LogoDark} alt="Logo dark" />
				<Card.Title class="text-2xl">Login</Card.Title>
				<Card.Description>Enter your credentials to login to the dashboard</Card.Description>
				<p class="text-rose-600 dark:text-rose-500">{actionData?.message}</p>
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
				<Form.Field {form} name="password">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Password</Form.Label>
							<Input type="password" {...props} bind:value={$formData.password} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
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
				<Form.Button type="submit">Submit</Form.Button>
			</Card.Content>
		</Card.Root>
	</form>
</div>
