<script lang="ts">
	let {
		caption,
		data
	}: {
		caption: string;
		data: {
			building: string;
			insideCount: number;
		}[];
	} = $props();
</script>

<table>
	<caption>{caption}</caption>
	{#each data as { building, insideCount }}
		<thead>
			<tr>
				<th>
					{building}
				</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>
					{insideCount}
				</td>
			</tr>
		</tbody>
	{/each}
</table>
