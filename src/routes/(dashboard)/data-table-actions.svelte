<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { guarantorDialogStore } from '$lib/stores/guarantorDialog.svelte';
	import { StateInside, type State } from '$lib/types/state';
	import { Guest, type PersonType } from '$lib/types/person';
	import { ArrowLeftRight, LogIn, LogOut } from 'lucide-svelte';
	import { tick } from 'svelte';

	let {
		personId,
		personType,
		personState,
		building,
		userBuilding,
		toggleStateFormSubmit
	}: {
		personId: number;
		personType: PersonType;
		personState: State;
		building: string | null;
		userBuilding: string;
		toggleStateFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void;
	} = $props();

	const inside = $derived(personState === StateInside);
	const sameBuilding = $derived(userBuilding === building);
</script>

{#if inside && sameBuilding}
	<Button
		onclick={() => {
			guarantorDialogStore.personId = personId;
			guarantorDialogStore.guarantorId = undefined;
			tick().then(() => toggleStateFormSubmit());
		}}
		variant="outline"
		class="w-full"
	>
		<LogOut />
		<span class="hidden sm:block">Release</span>
	</Button>
{:else if personType !== Guest}
	<Button
		onclick={() => {
			guarantorDialogStore.personId = personId;
			guarantorDialogStore.guarantorId = undefined;
			tick().then(() => toggleStateFormSubmit());
		}}
		variant="outline"
		class="w-full"
	>
		{#if inside}
			<ArrowLeftRight />
			<span class="hidden sm:block">Transfer</span>
		{:else}
			<LogIn />
			<span class="hidden sm:block">Admit</span>
		{/if}
	</Button>
{:else}
	<Button
		onclick={() => {
			guarantorDialogStore.dialogOpen = true;
			guarantorDialogStore.personId = personId;
		}}
		type="button"
		variant="outline"
		class="w-full"
	>
		{#if inside}
			<ArrowLeftRight />
			<span class="hidden sm:block">Transfer</span>
		{:else}
			<LogIn />
			<span class="hidden sm:block">Admit</span>
		{/if}
	</Button>
{/if}
