<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { PersonType } from '$lib/types/person';

	let {
		personsCount
	}: {
		personsCount: {
			type: PersonType;
			department: string;
			count: number;
		}[];
	} = $props();

	const allTypes = $derived(
		personsCount
			.filter((item, index, self) => self.findIndex((other) => other.type === item.type) === index)
			.map((d) => ({
				type: d.type,
				count: 0
			}))
			.sort((t1, t2) => t1.type.localeCompare(t2.type))
	);
	const departments = $derived.by(() => {
		const dataMap = personsCount.reduce(
			(acc, { department, type, count }) => {
				if (!acc[department]) acc[department] = {} as Record<PersonType, number>;
				if (type !== null) acc[department][type] = count;
				return acc;
			},
			{} as Record<string, Record<PersonType, number>>
		);

		return Object.entries(dataMap)
			.map(([department, types]) => ({
				department,
				types: [
					...Object.entries(types).map(([type, count]) => ({
						type: type as PersonType,
						count
					})),
					...allTypes
				]
					.filter(
						(item, index, self) => self.findIndex((other) => other.type === item.type) === index
					)
					.sort((t1, t2) => t1.type.localeCompare(t2.type))
			}))
			.sort((d1, d2) => d1.department.localeCompare(d2.department));
	});

	const totalCountPerType = $derived(
		departments
			.flatMap((d) => d.types)
			.reduce(
				(acc, curr) => {
					const existingType = acc.find((item) => item.type === curr.type);
					if (!existingType) {
						return [...acc, curr];
					}
					existingType.count += curr.count;
					return acc;
				},
				[] as {
					type: PersonType;
					count: number;
				}[]
			)
			.sort((t1, t2) => t1.type.localeCompare(t2.type))
	);
</script>

<table class="w-full">
	<thead>
		<tr>
			<th class="w-1/3">Department</th>
			{#each allTypes as { type }}
				<th class="w-1/3">{type}</th>
			{/each}
		</tr>
	</thead>
	<tbody class="text-center">
		{#each departments as { department, types }}
			<tr>
				<td>{department}</td>
				{#each types as { count }}
					<td>{count}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<Separator class="my-3" />

<table class="w-full">
	<thead>
		<tr>
			<th class="w-1/3">Type</th>
			<th class="w-1/3">Total</th>
		</tr>
	</thead>
	<tbody class="text-center">
		{#each totalCountPerType as { type, count }}
			<tr>
				<td>{type}</td>
				<td>{count}</td>
			</tr>
		{/each}
	</tbody>
</table>
