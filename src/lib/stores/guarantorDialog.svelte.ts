export const guarantorDialogStore = $state({
	dialogOpen: false,
	personId: undefined,
	guarantorId: undefined
} as {
	dialogOpen: boolean;
	personId: number | undefined;
	guarantorId: number | undefined;
});
