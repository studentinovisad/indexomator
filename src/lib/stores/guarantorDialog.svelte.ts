import type { SuperForm } from 'sveltekit-superforms';

export const guarantorDialogStore = $state({
	dialogOpen: false,
	selectedGuarantorId: undefined,
	rowToggleStateForm: undefined
} as {
	dialogOpen: boolean;
	selectedGuarantorId: number | undefined;
	rowToggleStateForm:
		| SuperForm<
				{
					personId: number;
					guarantorId?: number | undefined;
				},
				any
		  >
		| undefined;
});
