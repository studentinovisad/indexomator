<script lang="ts">
	import { Employee, type Person } from '$lib/types/person';
	import AccordionTrigger from '../../ui/accordion/accordion-trigger.svelte';
	import { StateInside } from '$lib/types/state';
	import { type StateFormSubmitProps } from '$lib/utils';
	import Badge from '../../ui/badge/badge.svelte';
	import PersonActionButtons from '../../../../routes/(dashboard)/person-action-buttons.svelte';
	import StatusIndicator from '../card-list/status-indicator.svelte';

	interface PersonCardProps {
		person: Person;
		stateFormSubmitProps: StateFormSubmitProps;
	}

	let { person, stateFormSubmitProps }: PersonCardProps = $props();
	let { userBuilding, toggleStateFormSubmit, toggleGuestStateFormSubmit, showGuestsFormSubmit } =
		stateFormSubmitProps;

	const personNameContainerStyle = 'flex xs:hidden min-w-0 truncate';

	const isInside = $derived(person.state === StateInside);
</script>

<AccordionTrigger class="overflow-hidden hover:no-underline">
	<div class="xs:text-xs flex w-full items-center justify-between gap-4 overflow-x-auto">
		<div
			class="max-w-3/5 flex flex-1 items-center space-x-1 overflow-x-scroll text-xs sm:text-sm xl:w-4/6"
		>
			<span class={personNameContainerStyle}>
				{person.fname}
			</span>
			<span class={personNameContainerStyle}>
				{person.lname}
			</span>
			<Badge variant="secondary">{person.type === Employee ? 'Employee' : person.identifier}</Badge>
		</div>
		<div class="flex w-2/5 flex-shrink items-center justify-end gap-2 xl:w-2/6">
			<PersonActionButtons
				{person}
				{userBuilding}
				{toggleStateFormSubmit}
				{toggleGuestStateFormSubmit}
				{showGuestsFormSubmit}
			/>
			<StatusIndicator {isInside} />
		</div>
	</div>
</AccordionTrigger>
