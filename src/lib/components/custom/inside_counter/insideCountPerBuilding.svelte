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

	const allBuildings = [
		...new Set([...dataStudents, ...dataEmployees].map((item) => item.building))
	];
	const mergedData = allBuildings.map((building) => {
		const studentEntry = dataStudents.find((s) => s.building === building);
		const employeeEntry = dataEmployees.find((e) => e.building === building);
		if (studentEntry === undefined || employeeEntry === undefined) {
			throw new Error('Invalid student or employee data');
			// ^^ Should never happen
		}

		return {
			building: building,
			studentInsideCount: studentEntry.insideCount,
			employeeInsideCount: employeeEntry.insideCount
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
		{#each mergedData as { building, studentInsideCount, employeeInsideCount }}
			<tr>
				<td>{building}</td>
				<td>{studentInsideCount}</td>
				<td>{employeeInsideCount}</td>
			</tr>
		{/each}
	</tbody>
</table>
