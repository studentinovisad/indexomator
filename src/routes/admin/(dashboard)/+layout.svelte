<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Form from '$lib/components/ui/form';
	import AppSidebar from '$lib/components/custom/sidebar/admin-sidebar.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Power } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { adminLogoutFormSchema } from './schema.js';

	let { children, data } = $props();

	const adminLogoutForm = superForm(data.adminLogoutForm, {
		validators: zodClient(adminLogoutFormSchema)
	});
	const { enhance: adminLogoutEnhance } = adminLogoutForm;
</script>

<Sidebar.Provider open={true}>
	<AppSidebar />
	<main class="w-full">
		<header class="flex h-16 w-full shrink-0 items-center gap-2 border-b">
			<div class="ml-2"><Sidebar.Trigger /></div>
			<Separator orientation="vertical" class="mr-10 h-4" />
			<h1 class="text-lg">
				{#if page.url.pathname === '/admin/create/department'}
					Create Department
				{:else if page.url.pathname === '/admin/create/university'}
					Create University
				{:else if page.url.pathname === '/admin/create/building'}
					Create Building
				{:else if page.url.pathname === '/admin/nuke'}
					Nuke Building
				{:else if page.url.pathname === '/admin/user/register'}
					Register User
				{:else if page.url.pathname === '/admin/user/disable'}
					Disable User
				{:else}
					Admin Homepage
				{/if}
			</h1>
		</header>
		{@render children?.()}
	</main>
</Sidebar.Provider>

<form method="POST" action="/admin/?/logout" class="absolute right-14 top-3" use:adminLogoutEnhance>
	<Form.Field class="hidden" form={adminLogoutForm} name="adminSessionId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={data.adminSessionId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button variant="outline" size="icon" class="flex-shrink-0">
		<Power class="h-[1.2rem] w-[1.2rem]" />
		<span class="sr-only">Logout</span>
	</Form.Button>
</form>
