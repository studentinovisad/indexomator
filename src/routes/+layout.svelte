<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import ThemeToggle from '$lib/components/custom/themetoggle/theme-toggle.svelte';

	let { children } = $props();
</script>

<Toaster richColors expand={true} />

<ModeWatcher defaultMode={'dark'} />
<ThemeToggle />

{@render children()}
