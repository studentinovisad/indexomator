<script lang="ts">
	let {
		dataStudents,
		dataEmployees
	}: {
		dataStudents: {
			building: string;
			insideCount: number;
		}[];
		dataEmployees: {
			building: string;
			insideCount: number;
		}[];
	} = $props();

	let mergedData = dataStudents.map((studentData) => {
		const employeeData = dataEmployees.find(
			(employeeData) => employeeData.building === studentData.building
		);

		return {
			building: studentData.building,
			insideCountStudents: studentData.insideCount,
			insideCountEmployees: employeeData ? employeeData.insideCount : 0
		};
	});
</script>

<table class="w-full">
	<thead>
		<tr>
			<th class="w-1/3">Building</th>
			<th class="w-1/3">Students</th>
			<th class="w-1/3">Employees</th>
		</tr>
	</thead>
	<tbody class="text-center">
		{#each mergedData as { building, insideCountStudents, insideCountEmployees }}
			<tr>
				<td>{building}</td>
				<td>{insideCountStudents}</td>
				<td>{insideCountEmployees}</td>
			</tr>
		{/each}
	</tbody>
</table>
