<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { ArrowLeftRight, LogIn, LogOut } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import type { State } from '$lib/types/state';
	import type { ToggleStateEnhance, ToggleStateForm } from './schema';

	let {
		personId,
		guarantorId,
		building,
		state,
		userBuilding,
		toggleStateForm,
		toggleStateEnhance
	}: {
		personId: number;
		guarantorId: number | null;
		building: string | null;
		state: State;
		userBuilding: string;
		toggleStateForm: ToggleStateForm;
		toggleStateEnhance: ToggleStateEnhance;
	} = $props();

	const inside = $derived(state === 'Inside');
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
				<Input {...props} type="hidden" value={guarantorId} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
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
</form>
