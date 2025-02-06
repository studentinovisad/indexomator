<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import CountType from './countType.svelte';
	import CountDepartment from './countDepartment.svelte';
	import CountUniversity from './countUniversity.svelte';
	import CountInside from './countInside.svelte';
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

	const allTypes = $derived(actionData?.allTypes ?? data.allTypes);
	const personsInsideCount = $derived(actionData?.personsInsideCount ?? data.personsInsideCount);
	const personsCountPerType = $derived(actionData?.personsCountPerType ?? data.personsCountPerType);
	const personsCountPerDepartment = $derived(
		actionData?.personsCountPerDepartment ?? data.personsCountPerDepartment
	);
	const personsCountPerUniversity = $derived(
		actionData?.personsCountPerUniversity ?? data.personsCountPerUniversity
	);
</script>

<form
	method="POST"
	class="flex w-full items-center justify-center px-4 pt-[5dvh] sm:pt-[10dvh]"
	use:enhance
>
	<Tabs.Root value="inside" class="mx-auto w-full max-w-sm">
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="inside">Inside</Tabs.Trigger>
			<Tabs.Trigger value="general">General</Tabs.Trigger>
			<Tabs.Trigger value="department">Department</Tabs.Trigger>
			<Tabs.Trigger value="university">University</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="inside">
			<Card.Root>
				<Card.Header>
					<Card.Title>Inside Statistics</Card.Title>
					<Card.Description>Check how many people are currently inside.</Card.Description>
				</Card.Header>
				<Card.Content>
					<CountInside {allTypes} {personsInsideCount} />
				</Card.Content>
				<Card.Footer>
					<Button type="submit" class="mx-auto">Refresh</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="general">
			<Card.Root>
				<Card.Header>
					<Card.Title>General Statistics</Card.Title>
					<Card.Description>Check how many people are in the system per type.</Card.Description>
				</Card.Header>
				<Card.Content>
					<CountType {personsCountPerType} />
				</Card.Content>
				<Card.Footer>
					<Button type="submit" class="mx-auto">Refresh</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="department">
			<Card.Root>
				<Card.Header>
					<Card.Title>Department Statistics</Card.Title>
					<Card.Description>
						Check how many people are in the system per department.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<CountDepartment {personsCountPerDepartment} />
				</Card.Content>
				<Card.Footer>
					<Button type="submit" class="mx-auto">Refresh</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="university">
			<Card.Root>
				<Card.Header>
					<Card.Title>University Statistics</Card.Title>
					<Card.Description>
						Check how many people are in the system per university.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<CountUniversity {personsCountPerUniversity} />
				</Card.Content>
				<Card.Footer>
					<Button type="submit" class="mx-auto">Refresh</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</form>
