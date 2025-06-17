<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn, PersonViewType } from '$lib/utils';
	import { IdCard, Table } from 'lucide-svelte';

	type ViewUpdaterFunction = (newViewType: PersonViewType) => void;

	interface PersonViewSelectorProps {
		selectedViewType: PersonViewType;
		onUpdateView: ViewUpdaterFunction;
	}

	let { selectedViewType, onUpdateView }: PersonViewSelectorProps = $props();

	const isCardView = $derived(selectedViewType === PersonViewType.Cards);
	const isTableView = $derived(selectedViewType === PersonViewType.Table);

	const buttonStyle = cn('flex-shrink-0', buttonVariants({ variant: 'outline', size: 'icon' }));
</script>

<div class="ml-auto inline-flex space-x-1">
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger
				class={buttonStyle}
				onclick={() => {
					onUpdateView(PersonViewType.Cards);
				}}
				disabled={isCardView}
			>
				<IdCard />
			</Tooltip.Trigger>
		</Tooltip.Root>
		<Tooltip.Root>
			<Tooltip.Trigger
				class={buttonStyle}
				onclick={() => {
					onUpdateView(PersonViewType.Table);
				}}
				disabled={isTableView}
			>
				<Table />
			</Tooltip.Trigger>
		</Tooltip.Root>
	</Tooltip.Provider>
</div>
