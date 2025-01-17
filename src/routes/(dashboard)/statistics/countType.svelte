<script lang="ts">
	import type { PersonType } from '$lib/types/person';

	let {
		personsCountPerType
	}: {
		personsCountPerType: {
			type: PersonType;
			count: number;
		}[];
	} = $props();
</script>

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
