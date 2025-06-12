export const toggleStateFormStore: {
	dialogOpen: boolean;
	personId: number | undefined;
	action: string;
	isLoadingForm: boolean;
} = $state({
	dialogOpen: false,
	personId: undefined,
	action: 'admit',
	isLoadingForm: false
});
