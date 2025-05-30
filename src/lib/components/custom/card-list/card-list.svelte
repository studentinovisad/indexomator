<script lang="ts">
	import PersonCard from './PersonCard.svelte';

	import type { Person } from '$lib/types/person';
	import { type StateFormSubmitProps } from '$lib/utils';
	import InfiniteScroll from './infinite-scroll.svelte';

	interface CardListProps extends StateFormSubmitProps {
		data: Person[];
	}

	let {
		data,
		userBuilding,
		toggleStateFormSubmit,
		toggleGuestStateFormSubmit,
		showGuestsFormSubmit
	}: CardListProps = $props();

	let length = $state(10);
	const offset = $state(10);
	const persons = $derived(data.slice(0, length));
</script>

<div class="p-4 pt-0">
	{#if data}
		{#each persons as person}
			<PersonCard
				{person}
				{toggleGuestStateFormSubmit}
				{toggleStateFormSubmit}
				{showGuestsFormSubmit}
				{userBuilding}
			></PersonCard>
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
