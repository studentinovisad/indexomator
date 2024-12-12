<script lang="ts">
	import Power from 'lucide-svelte/icons/power';

	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input';

	let { id_session }: { id_session: string } = $props();
</script>

<form action="/logout" method="POST" class="absolute right-14 top-3">
	<Input type="hidden" name="id_session" value={id_session} />
	<Button type="submit" variant="outline" size="icon">
		<Power class="h-[1.2rem] w-[1.2rem]" />
		<span class="sr-only">Logout</span>
	</Button>
</form>
