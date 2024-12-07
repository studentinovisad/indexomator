<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/custom/sidebar/app-sidebar.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main>
		<div class="m-5"><Sidebar.Trigger /></div>
		{@render children?.()}
	</main>
</Sidebar.Provider>
