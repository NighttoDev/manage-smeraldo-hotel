// Reports database queries — Story 6.x
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAllRooms, calculateStatusCounts } from './rooms';
import { getActiveStaff, getAttendanceByMonth } from './attendance';
import type { RoomRow, RoomStatusCounts } from './rooms';
import type { ActiveStaffMember } from '$lib/types/attendance';

export type { RoomRow, RoomStatusCounts };

export interface DashboardData {
	rooms: RoomRow[];
	statusCounts: RoomStatusCounts;
	activeStaff: ActiveStaffMember[];
	/** staffId → shift_value for today only; absent staff have no key (use ?? 0 when reading) */
	attendanceToday: Record<string, number>;
	today: string; // YYYY-MM-DD
}

/**
 * Fetch all data required for the manager dashboard in parallel.
 * - rooms: all 23 rooms with current status
 * - statusCounts: per-status room counts
 * - activeStaff: all active staff members
 * - attendanceToday: map of staffId → shift_value for today (absent staff not present)
 */
export async function getDashboardData(
	supabase: SupabaseClient,
	today: string // YYYY-MM-DD
): Promise<DashboardData> {
	const [year, month] = today.split('-').map(Number);

	const [rooms, activeStaff, allMonthLogs] = await Promise.all([
		getAllRooms(supabase),
		getActiveStaff(supabase),
		getAttendanceByMonth(supabase, year, month)
	]);

	const statusCounts = calculateStatusCounts(rooms);

	// Build staffId → shift_value for today only
	const attendanceToday: Record<string, number> = {};
	for (const log of allMonthLogs) {
		if (log.log_date === today) {
			attendanceToday[log.staff_id] = log.shift_value;
		}
	}

	return { rooms, statusCounts, activeStaff, attendanceToday, today };
}
