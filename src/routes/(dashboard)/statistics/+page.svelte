<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Count from './count.svelte';
	import InsideCount from './insideCount.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	let { data, form: actionData } = $props();

	$effect(() => {
		const msg = actionData?.message;
		if (msg !== undefined) {
			if ($page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});

	const personsCountPerType = $derived(
		actionData?.personsCountPerType ?? data.personsCountPerType ?? []
	);
	const personsCountPerDepartment = $derived(
		actionData?.personsCountPerDepartment ?? data.personsCountPerDepartment ?? []
	);
	const personsCountPerUniversity = $derived(
		actionData?.personsCountPerUniversity ?? data.personsCountPerUniversity ?? []
	);
	const personsInsideCount = $derived(
		actionData?.personsInsideCount ?? data.personsInsideCount ?? []
	);
</script>

<form
	method="POST"
	class="flex w-full items-center justify-center px-4 pt-[5dvh] sm:pt-[10dvh]"
	use:enhance
>
	<Tabs.Root value="general" class="mx-auto w-full max-w-sm">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="general">General</Tabs.Trigger>
			<Tabs.Trigger value="inside">Inside</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="general">
			<Card.Root>
				<Card.Header>
					<Card.Title>General Statistics</Card.Title>
					<Card.Description>Check how many people are in the system.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Count {personsCountPerType} {personsCountPerDepartment} {personsCountPerUniversity} />
				</Card.Content>
				<Card.Footer>
					<Button type="submit" class="mx-auto">Refresh</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="inside">
			<Card.Root>
				<Card.Header>
					<Card.Title>Inside Statistics</Card.Title>
					<Card.Description>Check how many people are currently inside.</Card.Description>
				</Card.Header>
				<Card.Content>
					<InsideCount {personsInsideCount} />
				</Card.Content>
				<Card.Footer>
					<Button type="submit" class="mx-auto">Refresh</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</form>
