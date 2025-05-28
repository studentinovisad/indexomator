<script lang="ts">
	import type { Person } from '$lib/types/person';
	import DataTableActions from '../../../../routes/(dashboard)/data-table-actions.svelte';
	import { Accordion } from '../accordion';
	import AccordionItem from '../accordion/accordion-item.svelte';
	import AccordionTrigger from '../accordion/accordion-trigger.svelte';
	import AccordionContent from '../accordion/accordion-content.svelte';
	import { StateInside } from '$lib/types/state';
	import { cn } from '$lib/utils';
	import InfiniteScroll from './infinite-scroll.svelte';
	import { Building, Cuboid, University } from 'lucide-svelte';
	import Badge from '../badge/badge.svelte';

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

	let length = $state(10);
	const offset = $state(10);
	const persons = $derived(data.slice(0, length));

	const isInside = (person: Person) => person.state === StateInside;
</script>

<div class="p-4 pt-0">
	{#if data}
		{#each persons as person}
			<Accordion type="multiple" class="[&:last-child>.child]:border-none">
				<AccordionItem value={person.identifier} class="child">
					<AccordionTrigger class="overflow-hidden hover:no-underline">
						<div class="xs:text-xs flex w-full items-center justify-between gap-4 overflow-x-auto">
							<div class="flex w-3/5 min-w-0 flex-1 items-center space-x-1 text-xs sm:text-sm">
								<span class="flex min-w-0 truncate">
									{person.fname}
								</span>
								<span class="flex min-w-0 truncate">
									{person.lname}
								</span>
								<Badge variant="secondary">{person.identifier}</Badge>
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
											isInside(person) ? 'bg-green-600' : 'bg-red-600'
										)}
									></span>
								</div>
							</div>
						</div>
					</AccordionTrigger>
					<AccordionContent>
						<div class="align-items-center flex flex-col gap-2">
							<span class="align-items-center flex flex-row gap-x-2"
								><Cuboid size={18} /> Department: {person.department}</span
							>
							<div class="align-items-center flex flex-row gap-x-2">
								<University size={18} />
								<span>University: {person.university ? person.university : 'Not provided.'}</span>
							</div>
							<div class="align-items-center flex flex-row gap-x-2">
								<Building size={18} />Building:
								<span>{person.building ? person.building : 'Not inside.'}</span>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
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
