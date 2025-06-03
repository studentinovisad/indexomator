<script lang="ts">
	import PersonCard from '../person-card/person-card.svelte';

	import type { Person } from '$lib/types/person';
	import { type StateFormSubmitProps } from '$lib/utils';
	import InfiniteScroll from './infinite-scroll.svelte';

	interface CardListProps {
		data: Person[];
		stateFormSubmitProps: StateFormSubmitProps;
	}

	let { data, stateFormSubmitProps }: CardListProps = $props();

	let length = $state(10);
	const offset = $state(10);
	const persons = $derived(data.slice(0, length));
</script>

<div class="p-4 pt-0">
	{#if data}
		{#each persons as person (person.id)}
			<PersonCard {person} {stateFormSubmitProps}></PersonCard>
		{:else}
			No data to show.
		{/each}
		{#if persons.length < data.length}
			<InfiniteScroll
				hasMore={persons.length < data.length}
				loadMore={() => {
					length += offset;
				}}
			/>
		{/if}
	{/if}
</div>
