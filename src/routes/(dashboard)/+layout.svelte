<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Form from '$lib/components/ui/form';
	import AppSidebar from '$lib/components/custom/sidebar/app-sidebar.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Power } from 'lucide-svelte';
	import { User } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { logoutFormSchema } from './schema.js';

	let { children, data } = $props();

	const logoutForm = superForm(data.logoutForm, {
		validators: zodClient(logoutFormSchema)
	});
	const { enhance: logoutEnhance } = logoutForm;
</script>

<Sidebar.Provider open={true}>
	<AppSidebar />
	<main class="w-full">
		<header class="flex h-16 w-full shrink-0 items-center gap-2 border-b">
			<div class="ml-2"><Sidebar.Trigger /></div>
			<Separator orientation="vertical" class="mr-10 h-4" />
			<h1 class="text-lg">
				{#if page.url.pathname === '/create/student'}
					Create Student
				{:else if page.url.pathname === '/create/employee'}
					Create Employee
				{:else if page.url.pathname === '/create/guest'}
					Create Guest
				{:else if page.url.pathname === '/statistics'}
					Statistics
				{:else if page.url.pathname === '/instructions'}
					Instructions
				{:else if page.url.pathname === '/profile'}
					User Profile
				{:else}
					Homepage
				{/if}
			</h1>
		</header>
		{@render children?.()}
	</main>
</Sidebar.Provider>

<form method="POST" action="/?/logout" class="absolute right-[6.25rem] top-3" use:logoutEnhance>
	<Form.Field class="hidden" form={logoutForm} name="sessionId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={data.sessionId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button variant="outline" size="icon" class="flex-shrink-0">
		<Power class="h-[1.2rem] w-[1.2rem]" />
		<span class="sr-only">Logout</span>
	</Form.Button>
</form>

<div class="absolute right-14 top-3">
	<Button href="/profile" variant="outline" size="icon" class="flex-shrink-0">
		<User class="h-[1.2rem] w-[1.2rem]" />
		<span class="sr-only">User Profile</span>
	</Button>
</div>
