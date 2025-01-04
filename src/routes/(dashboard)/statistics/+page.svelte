<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import CountPerDepartment from '$lib/components/custom/stats/countPerDepartment.svelte';
	import InsideCountPerBuilding from '$lib/components/custom/stats/insideCountPerBuilding.svelte';

	let { data } = $props();

	const personsCount = $derived(data.personsCount ?? []);
	const personsInsideCount = $derived(data.personsInsideCount ?? []);
</script>

<div class="flex h-[90dvh] w-full items-center justify-center px-4 pb-[30dvh]">
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
					<CountPerDepartment {personsCount} />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="inside">
			<Card.Root>
				<Card.Header>
					<Card.Title>Inside Statistics</Card.Title>
					<Card.Description>Check how many people are currently inside.</Card.Description>
				</Card.Header>
				<Card.Content>
					<InsideCountPerBuilding {personsInsideCount} />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
