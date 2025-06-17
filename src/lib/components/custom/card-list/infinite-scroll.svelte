<script lang="ts">
	interface InfiniteScrollProps {
		hasMore: boolean;
		loadMore: () => void;
	}

	import { onDestroy } from 'svelte';

	const { hasMore, loadMore }: InfiniteScrollProps = $props();
	const buffer = 300;

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
			rect.top <= (window.innerHeight || document.documentElement.clientHeight) + buffer &&
			rect.left <= (window.innerWidth || document.documentElement.clientWidth) + buffer &&
			rect.bottom >= -buffer &&
			rect.right >= -buffer
		);
	};

	const onScroll = () => {
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
