<script lang="ts">
	import type { PersonType } from '$lib/types/person';

	let {
		personsInsideCount
	}: {
		personsInsideCount: {
			type: PersonType | null;
			building: string;
			count: number;
		}[];
	} = $props();

	const allTypes = $derived(
		personsInsideCount
			.filter(
				(
					d
				): d is {
					type: PersonType;
					building: string;
					count: number;
				} => d.type !== null
			)
			.filter((item, index, self) => self.findIndex((other) => other.type === item.type) === index)
			.map((d) => ({
				type: d.type,
				count: 0
			}))
			.sort((t1, t2) => t1.type.localeCompare(t2.type))
	);
	const buildings = $derived.by(() => {
		const dataMap = personsInsideCount.reduce(
			(acc, { building, type, count }) => {
				if (!acc[building]) acc[building] = {} as Record<PersonType, number>;
				if (type !== null) acc[building][type] = count;
				return acc;
			},
			{} as Record<string, Record<PersonType, number>>
		);

		return Object.entries(dataMap)
			.map(([building, types]) => ({
				building,
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
			.sort((b1, b2) => b1.building.localeCompare(b2.building));
	});
</script>

<table class="w-full">
	<thead>
		<tr>
			<th class="w-1/3">Building</th>
			{#each allTypes as { type }}
				<th class="w-1/3">{type}</th>
			{/each}
		</tr>
	</thead>
	<tbody class="text-center">
		{#each buildings as { building, types }}
			<tr>
				<td>{building}</td>
				{#each types as { count }}
					<td>{count}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
