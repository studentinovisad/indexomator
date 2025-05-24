<script lang="ts">
	interface InfiniteScrollProps {
		hasMore: boolean;
		loadMore: () => void;
	}

	import { onDestroy } from 'svelte';

	const { hasMore, loadMore }: InfiniteScrollProps = $props();

	let isLoadingMore = false;
	let component: HTMLDivElement;

	$effect(() => {
		window.addEventListener('scroll', onScroll);

		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	});

	const isElementInViewport = (el: HTMLElement) => {
		const rect = el.getBoundingClientRect();

		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	};

	const onScroll = (e: Event) => {
		if (isElementInViewport(component)) {
			if (!isLoadingMore && hasMore) {
				isLoadingMore = true;
				loadMore();
			}
		} else {
			isLoadingMore = false;
		}
	};

	onDestroy(() => {
		window.removeEventListener('scroll', onScroll);
	});
</script>

<div bind:this={component} style="width:0px"></div>
