<script lang="ts">
	import type { Person } from '$lib/types/person';
	import { Accordion } from '../../ui/accordion';
	import AccordionItem from '../../ui/accordion/accordion-item.svelte';
	import AccordionTrigger from '../../ui/accordion/accordion-trigger.svelte';
	import AccordionContent from '../../ui/accordion/accordion-content.svelte';
	import { StateInside } from '$lib/types/state';
	import { cn, type StateFormSubmitProps } from '$lib/utils';
	import { Building, Cuboid, University } from 'lucide-svelte';
	import Badge from '../../ui/badge/badge.svelte';
	import PersonActionButtons from '../../../../routes/(dashboard)/person-action-buttons.svelte';

	interface PersonActionButtonsProps extends StateFormSubmitProps {
		person: Person;
	}

	let {
		person,
		userBuilding,
		toggleStateFormSubmit,
		toggleGuestStateFormSubmit,
		showGuestsFormSubmit
	}: PersonActionButtonsProps = $props();

	const isInside = (person: Person) => person.state === StateInside;
</script>

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
					<PersonActionButtons
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
