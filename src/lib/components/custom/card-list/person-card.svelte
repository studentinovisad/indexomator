<script lang="ts">
	import type { Person } from '$lib/types/person';
	import { Accordion } from '../../ui/accordion';
	import AccordionItem from '../../ui/accordion/accordion-item.svelte';
	import AccordionTrigger from '../../ui/accordion/accordion-trigger.svelte';
	import AccordionContent from '../../ui/accordion/accordion-content.svelte';
	import { StateInside } from '$lib/types/state';
	import { type StateFormSubmitProps } from '$lib/utils';
	import { Building, Cuboid, University } from 'lucide-svelte';
	import Badge from '../../ui/badge/badge.svelte';
	import PersonActionButtons from '../../../../routes/(dashboard)/person-action-buttons.svelte';
	import StatusIndicator from './status-indicator.svelte';

	interface PersonCardProps {
		person: Person;
		stateFormSubmitProps: StateFormSubmitProps;
		isFormLoading: boolean;
	}

	let { person, stateFormSubmitProps, isFormLoading }: PersonCardProps = $props();
	let { userBuilding, toggleStateFormSubmit, toggleGuestStateFormSubmit, showGuestsFormSubmit } =
		stateFormSubmitProps;

	const personContentContainerStyle = 'align-items-center flex flex-row gap-x-2';
	const iconSize = 18;
	const personNameContainerStyle = 'flex min-w-0 truncate';

	const isInside = $derived(person.state === StateInside);
</script>

<Accordion type="multiple" class="[&:last-child>.child]:border-none">
	<AccordionItem value={person.identifier} class="child">
		<AccordionTrigger class="overflow-hidden hover:no-underline">
			<div class="xs:text-xs flex w-full items-center justify-between gap-4 overflow-x-auto">
				<div class="flex w-3/5 min-w-0 flex-1 items-center space-x-1 text-xs sm:text-sm">
					<span class={personNameContainerStyle}>
						{person.fname}
					</span>
					<span class={personNameContainerStyle}>
						{person.lname}
					</span>
					<Badge variant="secondary">{person.identifier}</Badge>
				</div>
				<div class="flex w-2/5 flex-shrink items-center justify-end gap-2">
					<PersonActionButtons
						{person}
						{userBuilding}
						{toggleStateFormSubmit}
						{toggleGuestStateFormSubmit}
						{showGuestsFormSubmit}
						{isFormLoading}
					/>
					<StatusIndicator {isInside} />
				</div>
			</div>
		</AccordionTrigger>
		<AccordionContent>
			<div class="align-items-center flex flex-col gap-2">
				<div class={personContentContainerStyle}>
					<Cuboid size={iconSize} />
					<span>Department: {person.department}</span>
				</div>
				<div class={personContentContainerStyle}>
					<University size={iconSize} />
					<span>University: {person.university ?? 'Not provided.'}</span>
				</div>
				<div class={personContentContainerStyle}>
					<Building size={iconSize} />
					<span>Building: {person.building ?? 'Not inside.'}</span>
				</div>
			</div>
		</AccordionContent>
	</AccordionItem>
</Accordion>
