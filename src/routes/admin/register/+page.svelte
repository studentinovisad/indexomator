<script lang="ts">
	import { enhance } from '$app/forms';
	import Register from '$lib/components/custom/register/register-page.svelte';
</script>

<form method="POST" use:enhance>
	<Register />
</form>
