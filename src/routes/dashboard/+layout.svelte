<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/custom/sidebar/app-sidebar.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="w-full">
		<header class="flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
			<div class="m-5"><Sidebar.Trigger /></div>
			<Separator orientation="vertical" class="mr-10 h-4" />
		</header>
		{@render children?.()}
	</main>
</Sidebar.Provider>
