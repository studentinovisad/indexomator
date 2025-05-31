<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	interface SpinnerProps {
		size: 'small' | 'medium' | 'large';
		className?: string;
	}

	let { size, className }: SpinnerProps = $props();

	const spinnerClasses = 'flex flex-col items-center justify-center';

	const sizeMap = () => {
		switch (size) {
			case 'small':
				return 'size-6';
			case 'medium':
				return 'size-8';
			case 'large':
				return 'size-12';
		}
	};

	let loaderClass = $state(cn('animate-spin text-primary', sizeMap(), className));
</script>

<span class={spinnerClasses}>
	<Loader2 class={loaderClass} />
</span>
