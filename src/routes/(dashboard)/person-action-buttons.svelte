<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { StateInside } from '$lib/types/state';
	import { Guest, type Person } from '$lib/types/person';
	import { ArrowLeftRight, Ban, Handshake, LogIn, LogOut, Mouse } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { cn, type StateFormSubmitProps } from '$lib/utils';
	import { toggleStateFormStore } from '$lib/stores/toggleState.svelte';
	import { showGuestsFormStore } from '$lib/stores/showGuests.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';

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

	const isSameBuilding = $derived(userBuilding === person.building);
	const isInside = $derived(person.state === StateInside);

	const shouldShowLoadingSpinner = $derived(
		toggleStateFormStore.isLoadingForm && toggleStateFormStore.personId === person.id
	);

	const baseButtonClass = cn('min-w-0 flex-1', buttonVariants({ variant: 'outline' }));
	const baseSpanClass = 'hidden md:block';

	const handleSubmitButtonClick = (event: Event, onButtonClickFunction: () => void) => {
		event.stopPropagation();
		onButtonClickFunction();
	};

	const handleReleaseWithGuarantor = () => {
		toggleStateFormStore.personId = person.id;
		toggleStateFormStore.action = 'release';
		tick().then(() => {
			if (person.type === Guest) {
				toggleGuestStateFormSubmit();
			} else {
				toggleStateFormSubmit();
			}
		});
	};

	function handleReleaseWithoutGuarantor() {
		toggleStateFormStore.personId = person.id;
		toggleStateFormStore.action = 'release';
		tick().then(() => {
			if (person.type === Guest) {
				toggleGuestStateFormSubmit();
			} else {
				toggleStateFormSubmit();
			}
		});
	}

	function handleAdmitOrTransfer() {
		toggleStateFormStore.personId = person.id;
		toggleStateFormStore.action = isInside ? 'transfer' : 'admit';
		tick().then(() => toggleStateFormSubmit());
	}

	function handleAdmitOrTransferGuest() {
		toggleStateFormStore.personId = person.id;
		toggleStateFormStore.action = isInside ? 'transfer' : 'admit';
		toggleStateFormStore.dialogOpen = true;
	}

	function handleShowGuests() {
		showGuestsFormStore.guarantorId = person.id;
		tick().then(() => showGuestsFormSubmit());
		showGuestsFormStore.dialogOpen = true;
	}
</script>

<div class="flex w-full min-w-0 space-x-1 sm:space-x-2">
	{#if !person.banned}
		{#if isInside && isSameBuilding}
			{#if person.guarantorFname && person.guarantorLname && person.guarantorIdentifier}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger
							onclick={(event) => handleSubmitButtonClick(event, handleReleaseWithGuarantor)}
							class={baseButtonClass}
							value={'release'}
							disabled={shouldShowLoadingSpinner}
						>
							{#if shouldShowLoadingSpinner}
								<Spinner size={'medium'} />
							{:else}
								<LogOut />
								<span class={baseSpanClass}>Release</span>
							{/if}
						</Tooltip.Trigger>
						<Tooltip.Content>
							<span>
								{person.guarantorFname}
								{person.guarantorLname} ({person.guarantorIdentifier})
							</span>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			{:else}
				<Button
					onclick={(event) => handleSubmitButtonClick(event, handleReleaseWithoutGuarantor)}
					variant="outline"
					class={baseButtonClass}
					value={'release'}
					disabled={shouldShowLoadingSpinner}
				>
					{#if shouldShowLoadingSpinner}
						<Spinner size="medium" />
					{:else}
						<LogOut />
						<span class={baseSpanClass}>Release</span>
					{/if}
				</Button>
			{/if}
		{:else if person.type !== Guest}
			<Button
				onclick={(event) => handleSubmitButtonClick(event, handleAdmitOrTransfer)}
				variant="outline"
				class={baseButtonClass}
				value={isInside ? 'transfer' : 'admit'}
				disabled={shouldShowLoadingSpinner}
			>
				{#if shouldShowLoadingSpinner}
					<Spinner size="medium" />
				{:else if isInside}
					<ArrowLeftRight />
					<span class={baseSpanClass}>Transfer</span>
				{:else}
					<LogIn />
					<span class={baseSpanClass}>Admit</span>
				{/if}
			</Button>
		{:else}
			<Button
				onclick={(event) => handleSubmitButtonClick(event, handleAdmitOrTransferGuest)}
				type="button"
				variant="outline"
				class={baseButtonClass}
				value={isInside ? 'transfer' : 'admit'}
				disabled={shouldShowLoadingSpinner}
			>
				{#if shouldShowLoadingSpinner}
					<Spinner size="medium" />
				{:else if isInside}
					<ArrowLeftRight />
					<span class={baseSpanClass}>Transfer</span>
				{:else}
					<LogIn />
					<span class={baseSpanClass}>Admit</span>
				{/if}
			</Button>
		{/if}

		{#if person.type !== Guest}
			<Button onclick={handleShowGuests} type="button" variant="outline" class={baseButtonClass}>
				<Handshake />
				<span class={baseSpanClass}>Show guests</span>
			</Button>
		{/if}
	{:else}
		<Button type="button" variant="destructive" class="w-full" disabled>
			<Ban />
			<span class={baseSpanClass}>Banned</span>
		</Button>
	{/if}
</div>
