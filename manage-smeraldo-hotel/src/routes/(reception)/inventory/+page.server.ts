import type { PageServerLoad } from './$types';
import { getAllInventoryItems } from '$lib/server/db/inventory';

export const load: PageServerLoad = async ({ locals }) => {
	const items = await getAllInventoryItems(locals.supabase);

	return { items, role: locals.userRole };
};
