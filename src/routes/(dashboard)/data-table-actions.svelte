<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { ArrowLeftRight, LogIn, LogOut } from 'lucide-svelte';
	import type { State } from '$lib/types/state';
	import { toggleStateFormSchema, type ToggleStateFormValidated } from './schema';
	import type { PersonType } from '$lib/types/person';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import Button from '$lib/components/ui/button/button.svelte';
	import { guarantorDialogStore } from '$lib/stores/guarantorDialog.svelte';

	let {
		personId,
		personType,
		personState,
		building,
		userBuilding,
		toggleStateFormValidated
	}: {
		personId: number;
		personType: PersonType;
		personState: State;
		building: string | null;
		userBuilding: string;
		toggleStateFormValidated: ToggleStateFormValidated;
	} = $props();

	const toggleStateForm = superForm(toggleStateFormValidated, {
		id: `${personId}-toggle-state`,
		validators: zodClient(toggleStateFormSchema)
		// onUpdated: ({ form: f }) => {
		// 	if (actionData?.message === undefined) return;
		// 	const msg = actionData.message;
		// 	if (f.valid && $page.status === 200) {
		// 		toast.success(msg);
		// 	} else {
		// 		toast.error(msg);
		// 	}
		// }
	});
	const { enhance: toggleStateEnhance } = toggleStateForm;

	const inside = $derived(personState === 'Inside');
	const sameBuilding = $derived(userBuilding === building);
</script>

<form method="POST" action="?/togglestate" class="w-full" use:toggleStateEnhance>
	<Form.Field class="hidden" form={toggleStateForm} name="personId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={personId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field class="hidden" form={toggleStateForm} name="guarantorId">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} type="hidden" value={guarantorDialogStore.selectedGuarantorId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	{#if personType !== 'Guest'}
		<Form.Button variant="outline" class="w-full">
			{#if inside}
				{#if sameBuilding}
					<LogOut />
					<span class="hidden sm:block">Release</span>
				{:else}
					<ArrowLeftRight />
					<span class="hidden sm:block">Transfer</span>
				{/if}
			{:else}
				<LogIn />
				<span class="hidden sm:block">Admit</span>
			{/if}
		</Form.Button>
	{:else if inside && sameBuilding}
		<Form.Button variant="outline" class="w-full">
			<LogOut />
			<span class="hidden sm:block">Release</span>
		</Form.Button>
	{:else}
		<Button
			onclick={() => {
				guarantorDialogStore.dialogOpen = true;
				guarantorDialogStore.rowToggleStateForm = toggleStateForm;
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
</form>
