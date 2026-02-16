import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDashboardData } from '$lib/server/db/reports';

/** Vietnam is UTC+7 — offset in milliseconds */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export const load: PageServerLoad = async ({ locals }) => {
	// Use Vietnam local date (UTC+7), not UTC — prevents attendance showing as absent midnight–07:00
	const today = new Date(Date.now() + VN_OFFSET_MS).toISOString().slice(0, 10);

	try {
		const data = await getDashboardData(locals.supabase, today);
		return data;
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		console.error('[dashboard] getDashboardData failed:', message);
		throw error(500, 'Không thể tải dữ liệu dashboard');
	}
};
