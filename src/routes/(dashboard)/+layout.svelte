<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/custom/sidebar/app-sidebar.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	import { page } from '$app/stores';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="w-full">
		<header class="flex h-16 w-full shrink-0 items-center gap-2 border-b">
			<div class="ml-2"><Sidebar.Trigger /></div>
			<Separator orientation="vertical" class="mr-10 h-4" />
			<h1 class="text-lg">
				{#if $page.url.pathname === '/create/student'}
					Create Student
				{:else if $page.url.pathname === '/create/employee'}
					Create Employee
				{:else if $page.url.pathname === '/search'}
					Search
				{:else}
					Homepage
				{/if}
			</h1>
		</header>
		{@render children?.()}
	</main>
</Sidebar.Provider>
