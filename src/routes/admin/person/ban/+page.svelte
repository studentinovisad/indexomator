<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { formSchema } from './schema';
	import { page } from '$app/state';
	import { useId } from 'bits-ui';
	import { tick } from 'svelte';

	let { data, form: actionData } = $props();

	const formOne = superForm(data.form, {
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
	const { form: formData, enhance: formEnhance } = formOne;
</script>

<div class="flex w-full items-center justify-center px-4 pt-[5dvh] sm:pt-[10dvh]">
	<Tabs.Root value="single" class="mx-auto w-full max-w-sm">
		<Tabs.Content value="single">
			<form method="POST" action="?/single" use:formEnhance>
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-2xl">Ban person from building</Card.Title>
						<Card.Description>
							Type in the identifier of the person you want to ban.
						</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-4">
						<Form.Field form={formOne} name="personId">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Identifier</Form.Label>
									<Input {...props} bind:value={$formData.personId} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field form={formOne} name="secret">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Secret</Form.Label>
									<Input type="password" {...props} bind:value={$formData.secret} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</Card.Content>
				</Card.Root>
			</form>
		</Tabs.Content>
	</Tabs.Root>
</div>
