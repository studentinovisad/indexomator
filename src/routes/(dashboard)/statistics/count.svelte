<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { PersonType } from '$lib/types/person';

	let {
		personsCountPerType,
		personsCountPerDepartment,
		personsCountPerUniversity
	}: {
		personsCountPerType: {
			type: PersonType;
			count: number;
		}[];
		personsCountPerDepartment: {
			type: PersonType;
			department: string;
			count: number;
		}[];
		personsCountPerUniversity: {
			type: PersonType;
			university: string;
			count: number;
		}[];
	} = $props();

	const allTypesPerDepartments = $derived(
		personsCountPerDepartment
			.filter((item, index, self) => self.findIndex((other) => other.type === item.type) === index)
			.map((d) => ({
				type: d.type,
				count: 0
			}))
			.sort((t1, t2) => t1.type.localeCompare(t2.type))
	);
	const departments = $derived.by(() => {
		const dataMap = personsCountPerDepartment.reduce(
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
					...allTypesPerDepartments
				]
					.filter(
						(item, index, self) => self.findIndex((other) => other.type === item.type) === index
					)
					.sort((t1, t2) => t1.type.localeCompare(t2.type))
			}))
			.sort((d1, d2) => d1.department.localeCompare(d2.department));
	});

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
			<th class="w-1/3">Department</th>
			{#each allTypesPerDepartments as { type }}
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

<Separator class="my-3" />

<table class="w-full">
	<thead>
		<tr>
			<th class="w-1/3">Type</th>
			<th class="w-1/3">Total</th>
		</tr>
	</thead>
	<tbody class="text-center">
		{#each personsCountPerType as { type, count }}
			<tr>
				<td>{type}</td>
				<td>{count}</td>
			</tr>
		{/each}
	</tbody>
</table>
