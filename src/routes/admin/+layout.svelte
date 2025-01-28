<script lang="ts">
	import { page } from '$app/stores';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/custom/sidebar/admin-sidebar.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider open={true}>
	<AppSidebar />
	<main class="w-full">
		<header class="flex h-16 w-full shrink-0 items-center gap-2 border-b">
			<div class="ml-2"><Sidebar.Trigger /></div>
			<Separator orientation="vertical" class="mr-10 h-4" />
			<h1 class="text-lg">
				{#if $page.url.pathname === '/admin/register'}
					Register
				{:else if $page.url.pathname === '/admin/create/building'}
					Create Building
				{:else if $page.url.pathname === '/admin/create/department'}
					Create Department
				{:else if $page.url.pathname === '/admin/activate'}
					Activate / deactivate users
				{:else}
					Admin Homepage
				{/if}
			</h1>
		</header>
		{@render children?.()}
	</main>
</Sidebar.Provider>
