<script lang="ts">
	import { type Person } from '$lib/types/person';
	import AccordionContent from '../../ui/accordion/accordion-content.svelte';
	import { Building, Cuboid, University } from 'lucide-svelte';

	let { person }: { person: Person } = $props();

	const personContentContainerStyle = 'align-items-center flex flex-row gap-x-2';
	const iconSize = 18;
</script>

<AccordionContent>
	<div class="align-items-center flex flex-col gap-2">
		<span class="text-lg font-bold">{person.fname} {person.lname} - {person.identifier}</span>
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
