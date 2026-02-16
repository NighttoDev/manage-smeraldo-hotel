import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules BEFORE importing the module under test
vi.mock('./rooms', () => ({
	getAllRooms: vi.fn(),
	calculateStatusCounts: vi.fn()
}));

vi.mock('./attendance', () => ({
	getActiveStaff: vi.fn(),
	getAttendanceByMonth: vi.fn()
}));

import { getDashboardData } from './reports';
import { getAllRooms, calculateStatusCounts } from './rooms';
import { getActiveStaff, getAttendanceByMonth } from './attendance';

const mockRooms = [
	{ id: 'r1', room_number: '301', floor: 3, room_type: 'standard', status: 'occupied', current_guest_name: 'Alice', created_at: '', updated_at: '' },
	{ id: 'r2', room_number: '302', floor: 3, room_type: 'standard', status: 'available', current_guest_name: null, created_at: '', updated_at: '' },
	{ id: 'r3', room_number: '303', floor: 3, room_type: 'standard', status: 'being_cleaned', current_guest_name: null, created_at: '', updated_at: '' }
];

const mockStatusCounts = { available: 1, occupied: 1, checking_out_today: 0, being_cleaned: 1, ready: 0 };

const mockStaff = [
	{ id: 's1', full_name: 'Alice', role: 'reception' },
	{ id: 's2', full_name: 'Bob', role: 'housekeeping' }
];

const mockAttendanceLogs = [
	{ id: 'a1', staff_id: 's1', log_date: '2026-02-16', shift_value: 1, logged_by: 'u0', created_at: null, updated_at: null, staff_members: { full_name: 'Alice' } },
	{ id: 'a2', staff_id: 's2', log_date: '2026-02-15', shift_value: 0.5, logged_by: 'u0', created_at: null, updated_at: null, staff_members: { full_name: 'Bob' } } // different day
];

const mockSupabase = {} as never;

describe('getDashboardData', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getAllRooms).mockResolvedValue(mockRooms as never);
		vi.mocked(calculateStatusCounts).mockReturnValue(mockStatusCounts);
		vi.mocked(getActiveStaff).mockResolvedValue(mockStaff);
		vi.mocked(getAttendanceByMonth).mockResolvedValue(mockAttendanceLogs as never);
	});

	it('calls getAllRooms, getActiveStaff and getAttendanceByMonth', async () => {
		await getDashboardData(mockSupabase, '2026-02-16');

		expect(getAllRooms).toHaveBeenCalledWith(mockSupabase);
		expect(getActiveStaff).toHaveBeenCalledWith(mockSupabase);
		expect(getAttendanceByMonth).toHaveBeenCalledWith(mockSupabase, 2026, 2);
	});

	it('returns rooms, statusCounts, activeStaff and today', async () => {
		const result = await getDashboardData(mockSupabase, '2026-02-16');

		expect(result.rooms).toEqual(mockRooms);
		expect(result.statusCounts).toEqual(mockStatusCounts);
		expect(result.activeStaff).toEqual(mockStaff);
		expect(result.today).toBe('2026-02-16');
	});

	it('filters attendanceToday to only today\'s logs', async () => {
		const result = await getDashboardData(mockSupabase, '2026-02-16');

		// s1 has a log for today (2026-02-16), s2 has a log for yesterday (2026-02-15)
		expect(result.attendanceToday).toEqual({ s1: 1 });
		expect(result.attendanceToday['s2']).toBeUndefined();
	});

	it('returns empty attendanceToday when no logs match today', async () => {
		vi.mocked(getAttendanceByMonth).mockResolvedValue([]);
		const result = await getDashboardData(mockSupabase, '2026-02-16');

		expect(result.attendanceToday).toEqual({});
	});

	it('uses correct year and month from today string', async () => {
		await getDashboardData(mockSupabase, '2026-03-01');

		expect(getAttendanceByMonth).toHaveBeenCalledWith(mockSupabase, 2026, 3);
	});

	it('propagates errors from underlying functions', async () => {
		vi.mocked(getAllRooms).mockRejectedValue(new Error('DB error'));

		await expect(getDashboardData(mockSupabase, '2026-02-16')).rejects.toThrow('DB error');
	});
});
