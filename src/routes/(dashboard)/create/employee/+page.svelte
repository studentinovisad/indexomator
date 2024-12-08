<script lang="ts">
	import { enhance } from '$app/forms';
	import Employee from '$lib/components/custom/insert/employee.svelte';
</script>

<form method="POST" class="flex h-3/4 w-full items-center justify-center px-4" use:enhance>
	<Employee />
</form>
