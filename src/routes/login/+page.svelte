<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { logInFormSchema } from './schema';
	import LogoLight from '$lib/assets/images/light.svg';
	import LogoDark from '$lib/assets/images/dark.svg';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import Visible from 'lucide-svelte/icons/eye';
	import Invisible from 'lucide-svelte/icons/eye-closed';

	let { data, form: actionData } = $props();

	const logInForm = superForm(data.logInForm, {
		validators: zodClient(logInFormSchema),
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
	const { form: logInFormData, enhance: logInFormEnhance } = logInForm;

	let showPassword = $state(false);
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<form
		method="POST"
		class="flex w-full items-center justify-center px-4 pt-4"
		use:logInFormEnhance
	>
		<Card.Root class="mx-auto w-full max-w-sm portrait:border-0">
			<Card.Header class="flex-col items-center">
				<img class="hidden size-20 dark:block sm:pb-3" src={LogoLight} alt="Logo light" />
				<img class="block size-20 dark:hidden sm:pb-3" src={LogoDark} alt="Logo dark" />
				<Card.Title class="text-2xl">Login</Card.Title>
				<Card.Description class="hidden text-center xsm:block"
					>Enter your credentials to login to the dashboard.</Card.Description
				>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<Form.Field form={logInForm} name="username">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Username</Form.Label>
							<Input {...props} bind:value={$logInFormData.username} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={logInForm} name="password">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Password</Form.Label>
							<div class="flex gap-2">
								<Input
									type={showPassword ? 'text' : 'password'}
									{...props}
									bind:value={$logInFormData.password}
								/>
								<Button
									type="button"
									onclick={() => {
										showPassword = !showPassword;
									}}
									data-sidebar="trigger"
									variant="outline"
									size="icon"
								>
									{#if showPassword}
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
				<Form.Field form={logInForm} name="building">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Building</Form.Label>
							<Select.Root type="single" bind:value={$logInFormData.building} name={props.name}>
								<Select.Trigger {...props}>
									{$logInFormData.building ?? 'Select Building'}
								</Select.Trigger>
								<Select.Content>
									{#each data.buildings as { id, name } (id)}
										<Select.Item value={name} label={name} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button>Submit</Form.Button>
			</Card.Content>
			<Card.Footer>
				<p class="w-full px-2 text-center text-sm text-muted-foreground">
					This software is licensed under the <a
						href="https://raw.githubusercontent.com/studentinovisad/indexomator/refs/heads/main/LICENSE"
						class="underline underline-offset-4 hover:text-primary"
					>
						MIT
					</a> License.
				</p>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
