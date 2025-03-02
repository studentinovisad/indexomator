export const toggleStateFormStore: {
	dialogOpen: boolean;
	personId: number | undefined;
	action: string;
} = $state({
	dialogOpen: false,
	personId: undefined,
	action: 'admit'
});
