<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { guarantorDialogStore } from '$lib/stores/guarantorDialog.svelte';
	import { StateInside, type State } from '$lib/types/state';
	import { Guest, type PersonType } from '$lib/types/person';
	import { ArrowLeftRight, LogIn, LogOut } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		personId,
		guarantorFname,
		guarantorLname,
		guarantorIdentifier,
		personType,
		personState,
		building,
		userBuilding,
		isBanned,
		toggleStateFormSubmit
	}: {
		personId: number;
		guarantorFname: string | null;
		guarantorLname: string | null;
		guarantorIdentifier: string | null;
		personType: PersonType;
		personState: State;
		building: string | null;
		userBuilding: string;
		isBanned: boolean;
		toggleStateFormSubmit: (submitter?: HTMLElement | Event | EventTarget | null) => void;
	} = $props();

	const inside = $derived(personState === StateInside);
	const sameBuilding = $derived(userBuilding === building);
	const isBannedPerson = $derived(isBanned);
	const admitButtonText = $derived(isBannedPerson ? 'This person is banned' : 'Admit');
</script>

{#if inside && sameBuilding}
	{#if guarantorFname && guarantorLname && guarantorIdentifier}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger
					onclick={() => {
						guarantorDialogStore.personId = personId;
						guarantorDialogStore.guarantorId = undefined;
						tick().then(() => toggleStateFormSubmit());
					}}
					class={cn(
						'w-full',
						buttonVariants({ variant: 'outline' }),
						isBannedPerson && 'opacity-50 cursor-not-allowed'
					)}
					disabled={isBannedPerson}
				>
					<LogOut />
					<span class="hidden sm:block">Release</span>
				</Tooltip.Trigger>
				<Tooltip.Content>
					{#if isBannedPerson}
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
				guarantorDialogStore.personId = personId;
				guarantorDialogStore.guarantorId = undefined;
				tick().then(() => toggleStateFormSubmit());
			}}
			variant="outline"
			class={cn('w-full', isBannedPerson && 'opacity-50 cursor-not-allowed')}
			disabled={isBannedPerson}
		>
			<LogOut />
			<span class="hidden sm:block">Release</span>
		</Button>
	{/if}
{:else if personType !== Guest}
	<Button
		onclick={() => {
			guarantorDialogStore.personId = personId;
			guarantorDialogStore.guarantorId = undefined;
			tick().then(() => toggleStateFormSubmit());
		}}
		variant="outline"
		class={cn('w-full', isBannedPerson && 'opacity-50 cursor-not-allowed')}
		disabled={isBannedPerson}
	>
		{#if inside}
			<ArrowLeftRight />
			<span class="hidden sm:block">Transfer</span>
		{:else}
			<LogIn />
			<span class="hidden sm:block">{admitButtonText}</span>
		{/if}
	</Button>
{:else}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<Button
					onclick={() => {
						if (!isBannedPerson) {
							guarantorDialogStore.dialogOpen = true;
							guarantorDialogStore.personId = personId;
						}
					}}
					type="button"
					variant="outline"
					class={cn('w-full', isBannedPerson && 'opacity-50 cursor-not-allowed')}
					disabled={isBannedPerson}
				>
					{#if inside}
						<ArrowLeftRight />
						<span class="hidden sm:block">Transfer</span>
					{:else}
						<LogIn />
						<span class="hidden sm:block">{admitButtonText}</span>
					{/if}
				</Button>
			</Tooltip.Trigger>
			{#if isBannedPerson}
				<Tooltip.Content>
					<span class="text-red-500">This person is banned</span>
				</Tooltip.Content>
			{/if}
		</Tooltip.Root>
	</Tooltip.Provider>
{/if}
