<script lang="ts">
	import PersonCard from '../person-card/person-card.svelte';

	import type { Person } from '$lib/types/person';
	import { type StateFormSubmitProps } from '$lib/utils';
	import InfiniteScroll from './infinite-scroll.svelte';
	import { tick } from 'svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';

	interface CardListProps {
		data: Person[];
		stateFormSubmitProps: StateFormSubmitProps;
	}

	let { data, stateFormSubmitProps }: CardListProps = $props();
	const offset = 10;

	let length = $state(10);
	let isLoadingMore = $state(false);
	const persons = $derived(data.slice(0, length));

	const loadMore = async () => {
		if (isLoadingMore || length >= data.length) return;

		isLoadingMore = true;
		length = Math.min(length + offset, data.length);

		await tick();

		isLoadingMore = false;
	};
</script>

<div class="p-4 pt-0">
	{#if data}
		{#each persons as person (person.id)}
			<PersonCard {person} {stateFormSubmitProps}></PersonCard>
		{:else}
			No data to show.
		{/each}
		{#if persons.length < data.length}
			{#if isLoadingMore}
				<div class="flex items-center justify-center pt-4">
					<Spinner size="large" />
				</div>
			{/if}
			<InfiniteScroll hasMore={persons.length < data.length} {loadMore} />
		{/if}
	{/if}
</div>
