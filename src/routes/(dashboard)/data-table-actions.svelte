<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { StateInside } from '$lib/types/state';
	import { Guest, type Person } from '$lib/types/person';
	import { ArrowLeftRight, Ban, Handshake, LogIn, LogOut } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils';
	import { toggleStateFormStore } from '$lib/stores/toggleState.svelte';
	import { showGuestsFormStore } from '$lib/stores/showGuests.svelte';

	let {
		person,
		userBuilding,
		toggleStateFormSubmit,
		toggleGuestStateFormSubmit,
		showGuestsFormSubmit
	}: {
		person: Person;
		userBuilding: string;
		toggleStateFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void;
		toggleGuestStateFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void;
		showGuestsFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void;
	} = $props();

	const inside = $derived(person.state === StateInside);
	const sameBuilding = $derived(userBuilding === person.building);
</script>

<div class="flex space-x-1 sm:space-x-2">
	{#if !person.banned}
		{#if inside && sameBuilding}
			{#if person.guarantorFname && person.guarantorLname && person.guarantorIdentifier}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger
							onclick={() => {
								toggleStateFormStore.personId = person.id;
								toggleStateFormStore.action = 'release';
								tick().then(() => {
									if (person.type === Guest) {
										toggleGuestStateFormSubmit();
									} else {
										toggleStateFormSubmit();
									}
								});
							}}
							class={cn('w-full', buttonVariants({ variant: 'outline' }))}
							value={'release'}
						>
							<LogOut />
							<span class="hidden sm:block">Release</span>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<span
								>{person.guarantorFname}
								{person.guarantorLname} ({person.guarantorIdentifier})</span
							>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			{:else}
				<Button
					onclick={() => {
						toggleStateFormStore.personId = person.id;
						toggleStateFormStore.action = 'release';
						tick().then(() => {
							if (person.type === Guest) {
								toggleGuestStateFormSubmit();
							} else {
								toggleStateFormSubmit();
							}
						});
					}}
					variant="outline"
					class="w-full"
					value={'release'}
				>
					<LogOut />
					<span class="hidden sm:block">Release</span>
				</Button>
			{/if}
		{:else if person.type !== Guest}
			<Button
				onclick={() => {
					toggleStateFormStore.personId = person.id;
					toggleStateFormStore.action = 'admit';
					tick().then(() => toggleStateFormSubmit());
				}}
				variant="outline"
				class="w-full"
				value={'admit'}
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
					toggleStateFormStore.dialogOpen = true;
					toggleStateFormStore.personId = person.id;
					toggleStateFormStore.action = 'admit';
				}}
				type="button"
				variant="outline"
				class="w-full"
				value={'admit'}
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

		{#if person.type !== Guest}
			<Button
				onclick={() => {
					showGuestsFormStore.dialogOpen = true;
					showGuestsFormStore.guarantorId = person.id;
					tick().then(() => showGuestsFormSubmit());
				}}
				type="button"
				variant="outline"
				class="w-full"
			>
				<Handshake />
				<span class="hidden sm:block">Show guests</span>
			</Button>
		{/if}
	{:else}
		<Button type="button" variant="destructive" class="w-full" disabled>
			<Ban />
			<span class="hidden sm:block">Banned</span>
		</Button>
	{/if}
</div>
