import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Booking list — enhanced in Story 3.4
	return { bookings: [] };
};
