import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const id_session = locals.session?.id;
	return { id_session };
};
