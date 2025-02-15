<script>
    import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
    import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
    import { toast } from 'svelte-sonner';
	import { adminLoginSchema } from './schema';
	import { page } from '$app/state';
    import { Input } from '$lib/components/ui/input/index.js';

    let { data, form: actionData } = $props();

    const form = superForm(data.form, {
        validators: zodClient(adminLoginSchema),
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

<form method="POST" class="flex h-[90dvh] w-full items-center justify-center px-4" action="?/login" use:enhance>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Authnticate</Card.Title>
			<Card.Description>Enter secret to access admin functionalities.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field {form} name="secret">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Secret</Form.Label>
						<Input type="password" {...props} bind:value={$formData.secret} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button variant="default">Submit</Form.Button>
		</Card.Content>
	</Card.Root>
</form>

