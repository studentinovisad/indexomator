<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import ThemeToggle from '$lib/components/custom/themetoggle/theme-toggle.svelte';
	let { children } = $props();
</script>

<ModeWatcher />
<ThemeToggle />

{@render children()}
