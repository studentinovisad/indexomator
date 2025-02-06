<script lang="ts">
	import type { PersonType } from '$lib/types/person';

	let {
		personsCountPerUniversity
	}: {
		personsCountPerUniversity: {
			type: PersonType;
			university: string;
			count: number;
		}[];
	} = $props();

	const allTypesPerUniversity = $derived(
		personsCountPerUniversity
			.filter((item, index, self) => self.findIndex((other) => other.type === item.type) === index)
			.map((d) => ({
				type: d.type,
				count: 0
			}))
			.sort((t1, t2) => t1.type.localeCompare(t2.type))
	);
	const universities = $derived.by(() => {
		const dataMap = personsCountPerUniversity.reduce(
			(acc, { university, type, count }) => {
				if (!acc[university]) acc[university] = {} as Record<PersonType, number>;
				if (type !== null) acc[university][type] = count;
				return acc;
			},
			{} as Record<string, Record<PersonType, number>>
		);

		return Object.entries(dataMap)
			.map(([university, types]) => ({
				university,
				types: [
					...Object.entries(types).map(([type, count]) => ({
						type: type as PersonType,
						count
					})),
					...allTypesPerUniversity
				]
					.filter(
						(item, index, self) => self.findIndex((other) => other.type === item.type) === index
					)
					.sort((t1, t2) => t1.type.localeCompare(t2.type))
			}))
			.sort((u1, u2) => u1.university.localeCompare(u2.university));
	});
</script>

<table class="w-full">
	<thead>
		<tr>
			<th class="w-1/3">University</th>
			{#each allTypesPerUniversity as { type }}
				<th class="w-1/3">{type}</th>
			{/each}
		</tr>
	</thead>
	<tbody class="text-center">
		{#each universities as { university, types }}
			<tr>
				<td>{university}</td>
				{#each types as { count }}
					<td>{count}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
