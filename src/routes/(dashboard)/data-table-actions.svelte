<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { StateInside, type State } from '$lib/types/state';
	import { Guest, type PersonType } from '$lib/types/person';
	import { ArrowLeftRight, Handshake, LogIn, LogOut } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils';
	import { toggleStateFormStore } from '$lib/stores/toggleState.svelte';
	import { showGuestsFormStore } from '$lib/stores/showGuests.svelte';

	let {
		personId,
		guarantorFname,
		guarantorLname,
		guarantorIdentifier,
		personType,
		personState,
		building,
		userBuilding,
		banned,
		toggleStateFormSubmit,
		toggleGuestStateFormSubmit,
		showGuestsFormSubmit
	}: {
		personId: number;
		guarantorFname: string | null;
		guarantorLname: string | null;
		guarantorIdentifier: string | null;
		personType: PersonType;
		personState: State;
		building: string | null;
		userBuilding: string;
		banned: boolean;
		toggleStateFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void;
		toggleGuestStateFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void;
		showGuestsFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void;
	} = $props();

	const inside = $derived(personState === StateInside);
	const sameBuilding = $derived(userBuilding === building);
	const admitText = $derived(banned ? 'This person is banned' : 'Admit');
</script>

{#if inside && sameBuilding}
	{#if guarantorFname && guarantorLname && guarantorIdentifier}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger
					onclick={() => {
						toggleStateFormStore.personId = personId;
						tick().then(() => {
							if (personType === Guest) {
								toggleGuestStateFormSubmit();
							} else {
								toggleStateFormSubmit();
							}
						});
					}}
					class={cn(
						'w-full',
						buttonVariants({ variant: 'outline' }),
						banned && 'cursor-not-allowed opacity-50'
					)}
					disabled={banned}
				>
					<LogOut />
					<span class="hidden sm:block">Release</span>
				</Tooltip.Trigger>
				<Tooltip.Content>
					{#if banned}
						<span class="text-red-500">This person is banned</span>
					{:else}
						<span>{guarantorFname} {guarantorLname} ({guarantorIdentifier})</span>
					{/if}
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	{:else}
		<Button
			onclick={() => {
				toggleStateFormStore.personId = personId;
				tick().then(() => {
					if (personType === Guest) {
						toggleGuestStateFormSubmit();
					} else {
						toggleStateFormSubmit();
					}
				});
			}}
			variant="outline"
			class="w-full"
		>
			<LogOut />
			<span class="hidden sm:block">Release</span>
		</Button>
	{/if}
{:else if personType !== Guest}
	<Button
		onclick={() => {
			toggleStateFormStore.personId = personId;
			tick().then(() => toggleStateFormSubmit());
		}}
		variant="outline"
		class={cn('w-full', banned && 'cursor-not-allowed opacity-50')}
		disabled={banned}
	>
		{#if inside}
			<ArrowLeftRight />
			<span class="hidden sm:block">Transfer</span>
		{:else}
			<LogIn />
			<span class="hidden sm:block">{admitText}</span>
		{/if}
	</Button>
{:else}
	<Button
		onclick={() => {
			toggleStateFormStore.dialogOpen = true;
			toggleStateFormStore.personId = personId;
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
			<span class="hidden sm:block">{admitText}</span>
		{/if}
	</Button>
{/if}

{#if personType !== Guest}
	<Button
		onclick={() => {
			showGuestsFormStore.dialogOpen = true;
			showGuestsFormStore.guarantorId = personId;
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
