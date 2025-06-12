<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	import type { ClassValue } from 'clsx';

	export let value: string;
	export let className: ClassValue = undefined;

	export { className as class };
</script>

<AccordionPrimitive.Item {value} class={cn('border-b', className)} {...$$restProps}>
	<slot />
</AccordionPrimitive.Item>
