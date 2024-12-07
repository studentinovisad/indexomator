<script lang="ts">
	import { enhance } from '$app/forms';
	import Login from '$lib/components/custom/login/login-page.svelte';
</script>

<form method="POST" use:enhance>
	<Login />
</form>
