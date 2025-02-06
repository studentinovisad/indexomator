<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { oneSchema, allSchema } from './schema';
	import { page } from '$app/stores';

	let { data, form: actionData } = $props();

	const formOne = superForm(data.formOne, {
		validators: zodClient(oneSchema),
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

	const formAll = superForm(data.formAll, {
		validators: zodClient(allSchema),
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

	const { form: formOneData, enhance: enhanceOne } = formOne;
	const { form: formAllData, enhance: enhanceAll } = formAll;
</script>

<form method="POST" class="flex h-[90dvh] w-full items-center justify-center px-4" use:enhanceOne>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Disable a user</Card.Title>
			<Card.Description>Type in the id of the user you want to disable or enable.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field form={formOne} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Username</Form.Label>
						<Input {...props} bind:value={$formOneData.username} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field form={formOne} name="secret">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Secret</Form.Label>
						<Input type="password" {...props} bind:value={$formOneData.secret} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button formaction="?/disable">Disable</Form.Button>
			<Form.Button formaction="?/enable">Enable</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
<Separator />
<form method="POST" class="flex h-[90dvh] w-full items-center justify-center px-4" use:enhanceAll>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Disable all users</Card.Title>
			<Card.Description></Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field form={formAll} name="secret">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Secret</Form.Label>
						<Input type="password" {...props} bind:value={$formAllData.secret} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button formaction="?/disableall">Disable all</Form.Button>
			<Form.Button formaction="?/enableall">Enable all</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
