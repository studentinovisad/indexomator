<script lang="ts">
	import { type Person } from '$lib/types/person';
	import { Accordion } from '../../ui/accordion';
	import AccordionItem from '../../ui/accordion/accordion-item.svelte';
	import { type StateFormSubmitProps } from '$lib/utils';
	import PersonCardContent from './person-card-content.svelte';
	import PersonCardTrigger from './person-card-trigger.svelte';

	interface PersonCardProps {
		person: Person;
		stateFormSubmitProps: StateFormSubmitProps;
	}

	let { person, stateFormSubmitProps }: PersonCardProps = $props();
</script>

<Accordion type="multiple" class="[&:last-child>.child]:border-none">
	<AccordionItem value={person.identifier} class="child">
		<PersonCardTrigger {person} {stateFormSubmitProps} />
		<PersonCardContent {person} />
	</AccordionItem>
</Accordion>
