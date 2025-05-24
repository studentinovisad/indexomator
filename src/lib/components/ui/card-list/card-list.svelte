<script lang="ts">
	import type { Person } from '$lib/types/person';
	import DataTableActions from '../../../../routes/(dashboard)/data-table-actions.svelte';
	import { Accordion } from '../accordion';
	import AccordionItem from '../accordion/accordion-item.svelte';
	import AccordionTrigger from '../accordion/accordion-trigger.svelte';
	import AccordionContent from '../accordion/accordion-content.svelte';
	import { StateInside, StateOutside } from '$lib/types/state';
	import { cn } from '$lib/utils';

	type FormSubmitFunction = (submitter?: HTMLElement | Event | EventTarget | null) => void;

	type CardListProps = {
		data: Person[];
		userBuilding: string;
		toggleStateFormSubmit: FormSubmitFunction;
		toggleGuestStateFormSubmit: FormSubmitFunction;
		showGuestsFormSubmit: FormSubmitFunction;
	};

	let {
		data,
		userBuilding,
		toggleStateFormSubmit,
		toggleGuestStateFormSubmit,
		showGuestsFormSubmit
	}: CardListProps = $props();

	const isInside = (person: Person) => person.state == StateInside;
	const fullName = (person: Person) => `${person.fname} ${person.lname}`;
</script>

<div class="p-4 pt-0">
	{#if data}
		{#each data as person}
			<Accordion type="single">
				<AccordionItem value={person.identifier}>
					<AccordionTrigger class="overflow-hidden">
						<div class="xs:text-xs flex w-full items-center justify-between gap-4 overflow-x-auto">
							<div class="flex w-3/5 min-w-0 flex-1 space-x-1 text-xs sm:text-sm">
								<span class="flex min-w-0 truncate">
									{person.fname}
								</span>
								<span class="flex min-w-0 truncate">
									{person.lname}
								</span>
								<span>-</span>
								<span>{person.identifier}</span>
							</div>
							<div class="flex w-2/5 flex-shrink items-center justify-end gap-2">
								<DataTableActions
									{person}
									{userBuilding}
									{toggleGuestStateFormSubmit}
									{toggleStateFormSubmit}
									{showGuestsFormSubmit}
								/>

								<div class="p-3">
									<span
										class={cn(
											'inline-block',
											'h-2 w-2',
											'rounded-full',
											'mb-0.5',
											isInside(person) ? 'bg-green-500' : 'bg-red-600'
										)}
									></span>
								</div>
							</div>
						</div>
					</AccordionTrigger>
					<AccordionContent>
						{person.department}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		{:else}
			No data to show.
		{/each}
	{/if}
</div>
