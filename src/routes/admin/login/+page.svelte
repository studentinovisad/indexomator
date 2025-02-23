<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { adminLogInFormSchema } from './schema';
	import LogoLight from '$lib/assets/images/light.svg';
	import LogoDark from '$lib/assets/images/dark.svg';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Eye as Visible, EyeClosed as Invisible, Cookie } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let { data, form: actionData } = $props();

	const adminLogInForm = superForm(data.adminLogInForm, {
		validators: zodClient(adminLogInFormSchema),
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
	const { form: adminLogInFormData, enhance: adminLogInFormEnhance } = adminLogInForm;

	let showSecret = $state(false);

	onMount(() => {
		toast('This site has to use some necessary cookies to function normally.', {
			icon: Cookie,
			action: {
				label: 'Learn more',
				onClick: () => {
					window.open(
						'https://github.com/studentinovisad/indexomator/blob/main/PRIVACY.md',
						'_blank'
					);
				}
			}
		});
	});
</script>

<div class="flex h-screen w-full flex-col items-center justify-center px-4">
	<form
		method="POST"
		class="flex w-full items-center justify-center px-4 pt-4"
		use:adminLogInFormEnhance
	>
		<Card.Root class="mx-auto w-full max-w-sm portrait:border-0">
			<Card.Header class="flex-col items-center">
				<img class="hidden size-20 dark:block sm:pb-3" src={LogoLight} alt="Logo light" />
				<img class="block size-20 dark:hidden sm:pb-3" src={LogoDark} alt="Logo dark" />
				<Card.Title class="text-2xl">Admin Login</Card.Title>
				<Card.Description class="hidden text-center xsm:block">
					Enter your credentials to login to the admin dashboard.
				</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<Form.Field form={adminLogInForm} name="secret">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Secret</Form.Label>
							<div class="flex gap-2">
								<Input
									type={showSecret ? 'text' : 'password'}
									{...props}
									bind:value={$adminLogInFormData.secret}
								/>
								<Button
									type="button"
									onclick={() => {
										showSecret = !showSecret;
									}}
									data-sidebar="trigger"
									variant="outline"
									size="icon"
								>
									{#if showSecret}
										<Visible />
									{:else}
										<Invisible />
									{/if}
									<span class="sr-only">Show/Hide Secret</span>
								</Button>
							</div>
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
					</a>
					License.
					<!--TODO: Create Privacy Policy and Contributing-->
					<span class="mt-2 flex w-full justify-center gap-4"
						><a
							class="underline-offset-4 hover:text-primary hover:underline"
							href="https://github.com/studentinovisad/indexomator/blob/main/PRIVACY.md"
							>Privacy Policy</a
						><a
							class="underline-offset-4 hover:text-primary hover:underline"
							href="https://github.com/studentinovisad/indexomator/blob/main/CONTRIBUTING.md"
							>Contributing</a
						></span
					>
				</p>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
