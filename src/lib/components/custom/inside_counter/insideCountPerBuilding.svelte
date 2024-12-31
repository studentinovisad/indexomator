<script lang="ts">
	let {
		data
	}: {
		data: {
			building: string;
			insideCount: number;
		}[];
	} = $props();
</script>

<table class="w-full">
	<thead>
		<tr>
			<th class="w-1/3">Building</th>
			<th class="w-1/3">People</th>
		</tr>
	</thead>
	<tbody class="text-center">
		{#each data as { building, insideCount }}
			<tr>
				<td>{building}</td>
				<td>{insideCount}</td>
			</tr>
		{/each}
	</tbody>
</table>
