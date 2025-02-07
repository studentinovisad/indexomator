<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formOneSchema, formAllSchema } from './schema';
	import { page } from '$app/state';

	let { data, form: actionData } = $props();

	const formOne = superForm(data.formOne, {
		validators: zodClient(formOneSchema),
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
	const { form: formOneData, enhance: formOneEnhance } = formOne;

	const formAll = superForm(data.formAll, {
		validators: zodClient(formAllSchema),
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
	const { form: formAllData, enhance: formAllEnhance } = formAll;
</script>

<div class="flex w-full items-center justify-center px-4 pt-[5dvh] sm:pt-[10dvh]">
	<Tabs.Root value="single" class="mx-auto w-full max-w-sm">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="single">Single</Tabs.Trigger>
			<Tabs.Trigger value="all">All</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="single">
			<form method="POST" use:formOneEnhance>
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-2xl">Disable / Enable user</Card.Title>
						<Card.Description>
							Type in the username of the user you want to disable or enable.
						</Card.Description>
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
		</Tabs.Content>
		<Tabs.Content value="all">
			<form method="POST" use:formAllEnhance>
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-2xl">Disable / Enable all users</Card.Title>
						<Card.Description>Either disable or enable all users.</Card.Description>
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
		</Tabs.Content>
	</Tabs.Root>
</div>
