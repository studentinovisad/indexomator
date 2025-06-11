<script lang="ts">
	import { Guest, type Person } from '$lib/types/person';
	import AccordionContent from '../../ui/accordion/accordion-content.svelte';
	import { Building, Cuboid, HeartHandshake, PersonStanding, University } from 'lucide-svelte';

	let { person }: { person: Person } = $props();

	const personContentContainerStyle = 'align-items-center flex flex-row gap-x-2';
	const iconSize = 18;

	/**
	 * Guarantor name, it's label and the building name and it's label
	 * are a derived state since they are prone to change.
	 * The other information is not since the person's university
	 * and department cannot change as of now.
	 * Same goes for the person type.
	 */
	const isGuest = person.type === Guest;

	const departmentName = person.department ?? 'Not provided.';
	const guarantorName = $derived(
		person.guarantorId !== null
			? `${person.guarantorFname} ${person.guarantorLname}`
			: 'Not provided.'
	);
	const affiliationLabel = $derived(
		isGuest ? `Guarantor: ${guarantorName}` : `Department: ${departmentName}`
	);

	const universityName = person.university ?? 'Not provided';
	const universityLabel = `University: ${universityName}`;

	const currentBuilding = $derived(person.building ?? 'Not inside.');
	const buildingLabel = $derived(`Building: ${currentBuilding}`);
</script>

<AccordionContent>
	<div class="align-items-center flex flex-col gap-2">
		<span class="text-lg font-bold">{person.fname} {person.lname} - {person.identifier}</span>
		<div class={personContentContainerStyle}>
			{#if isGuest}
				<HeartHandshake size={iconSize} />
			{:else}
				<Cuboid size={iconSize} />
			{/if}
			<span>{affiliationLabel}</span>
		</div>
		<div class={personContentContainerStyle}>
			<University size={iconSize} />
			<span>{universityLabel}</span>
		</div>
		<div class={personContentContainerStyle}>
			<Building size={iconSize} />
			<span>{buildingLabel}</span>
		</div>
	</div>
</AccordionContent>
