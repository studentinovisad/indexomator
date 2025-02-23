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
	const { form: formData, enhance: formEnhance } = form;
</script>

<div class="flex w-full items-center justify-center px-4 pt-[5dvh] sm:pt-[10dvh]">
	<Tabs.Root value="ban" class="mx-auto w-full max-w-sm">
		<Tabs.Content value="ban">
			<form method="POST" action="?/ban" use:formEnhance>
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-2xl">Ban / Pardon person</Card.Title>
						<Card.Description>
							Type in the identifier of the person you want to ban or pardon.
						</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-4">
						<Form.Field {form} name="identifier">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Identifier</Form.Label>
									<Input {...props} bind:value={$formData.identifier} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="action" class="mx-auto">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Button {...props} value="ban" variant="destructive">Ban</Form.Button>
									<Form.Button {...props} value="pardon" variant="default">Pardon</Form.Button>
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
