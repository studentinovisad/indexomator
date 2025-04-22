<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { updatePasswordFormSchema } from './schema.js';
	import { Eye as Visible, EyeClosed as Invisible } from 'lucide-svelte';

	let { data, form: actionData } = $props();

	const updatePasswordForm = superForm(data.updatePasswordForm, {
		validators: zodClient(updatePasswordFormSchema),
		onUpdated: ({ form: f }) => {
			if (actionData?.message === undefined) return;

			if (!f.valid) {
				const msg = actionData.message;

				toast.error(msg);
			}
		}
	});
	const { form: updatePasswordFormData, enhance: updatePasswordFormEnhance } = updatePasswordForm;

	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showNewPasswordConfirmation = $state(false);
</script>

<form
	method="POST"
	class="flex w-full items-center justify-center px-4 pt-[5dvh] sm:pt-[10dvh]"
	use:updatePasswordFormEnhance
>
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title>Change password</Card.Title>
			<Card.Description>Enter your new password.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Form.Field form={updatePasswordForm} name="currentPassword">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Current password</Form.Label>
						<div class="flex gap-2">
							<Input
								type={showCurrentPassword ? 'text' : 'password'}
								{...props}
								bind:value={$updatePasswordFormData.currentPassword}
							/>
							<Button
								type="button"
								onclick={() => {
									showCurrentPassword = !showCurrentPassword;
								}}
								data-sidebar="trigger"
								variant="outline"
								size="icon"
							>
								{#if showCurrentPassword}
									<Visible />
								{:else}
									<Invisible />
								{/if}
								<span class="sr-only">Show/Hide Pass</span>
							</Button>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field form={updatePasswordForm} name="newPassword">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>New password</Form.Label>
						<div class="flex gap-2">
							<Input
								type={showNewPassword ? 'text' : 'password'}
								{...props}
								bind:value={$updatePasswordFormData.newPassword}
							/>
							<Button
								type="button"
								onclick={() => {
									showNewPassword = !showNewPassword;
								}}
								data-sidebar="trigger"
								variant="outline"
								size="icon"
							>
								{#if showNewPassword}
									<Visible />
								{:else}
									<Invisible />
								{/if}
								<span class="sr-only">Show/Hide Pass</span>
							</Button>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field form={updatePasswordForm} name="newPasswordConfirmation">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Confirm new password</Form.Label>
						<div class="flex gap-2">
							<Input
								type={showNewPasswordConfirmation ? 'text' : 'password'}
								{...props}
								bind:value={$updatePasswordFormData.newPasswordConfirmation}
							/>
							<Button
								type="button"
								onclick={() => {
									showNewPasswordConfirmation = !showNewPasswordConfirmation;
								}}
								data-sidebar="trigger"
								variant="outline"
								size="icon"
							>
								{#if showNewPasswordConfirmation}
									<Visible />
								{:else}
									<Invisible />
								{/if}
								<span class="sr-only">Show/Hide Pass</span>
							</Button>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Submit</Form.Button>
		</Card.Content>
	</Card.Root>
</form>
