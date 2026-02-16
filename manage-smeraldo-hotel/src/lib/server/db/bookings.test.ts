import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBooking, getBookingsByRoom, getAllBookings } from './bookings';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── Mock helpers ──────────────────────────────────────────────────────────────

const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockOrder = vi.fn();

function makeMockSupabase(): SupabaseClient {
	return {
		from: vi.fn(() => ({
			insert: mockInsert,
			select: mockSelect
		}))
	} as unknown as SupabaseClient;
}

beforeEach(() => {
	vi.resetAllMocks();
	// insert chain: .insert().select().single()
	mockInsert.mockReturnValue({ select: mockSelect });
	// select chain: .select().eq().in().order()
	mockSelect.mockReturnValue({
		single: mockSingle,
		eq: mockEq,
		in: mockIn,
		order: mockOrder
	});
	mockEq.mockReturnValue({ in: mockIn, order: mockOrder });
	mockIn.mockReturnValue({ order: mockOrder });
	mockOrder.mockReturnValue({ order: mockOrder });
});

// ── createBooking ─────────────────────────────────────────────────────────────

describe('createBooking', () => {
	const baseInsert = {
		room_id: 'room-uuid-1',
		guest_id: 'guest-uuid-1',
		check_in_date: '2026-03-01',
		check_out_date: '2026-03-05',
		booking_source: 'agoda' as const,
		created_by: 'staff-uuid-1'
	};

	it('creates a booking and returns the row', async () => {
		const mockRow = {
			id: 'booking-uuid-1',
			...baseInsert,
			nights_count: 4,
			status: 'confirmed',
			created_at: '2026-02-16T00:00:00Z',
			updated_at: '2026-02-16T00:00:00Z'
		};
		mockSingle.mockResolvedValue({ data: mockRow, error: null });

		const supabase = makeMockSupabase();
		const result = await createBooking(supabase, baseInsert);

		expect(result).toEqual(mockRow);
		expect(result.status).toBe('confirmed');
		// nights_count comes from DB, not the insert
		expect(result.nights_count).toBe(4);
	});

	it('does NOT include nights_count in the insert payload (GENERATED ALWAYS)', async () => {
		mockSingle.mockResolvedValue({ data: { id: 'x', ...baseInsert, nights_count: 4, status: 'confirmed', created_at: '', updated_at: '' }, error: null });

		const supabase = makeMockSupabase();
		await createBooking(supabase, baseInsert);

		// Verify insert was called WITHOUT nights_count
		const insertArg = mockInsert.mock.calls[0][0];
		expect(insertArg).not.toHaveProperty('nights_count');
	});

	it('throws when Supabase returns an error', async () => {
		mockSingle.mockResolvedValue({ data: null, error: { message: 'Room not found' } });

		const supabase = makeMockSupabase();
		await expect(createBooking(supabase, baseInsert)).rejects.toThrow(
			'createBooking failed: Room not found'
		);
	});

	it('throws when Supabase returns null data without error', async () => {
		mockSingle.mockResolvedValue({ data: null, error: null });

		const supabase = makeMockSupabase();
		await expect(createBooking(supabase, baseInsert)).rejects.toThrow(
			'createBooking failed: No data returned'
		);
	});
});

// ── getBookingsByRoom ─────────────────────────────────────────────────────────

describe('getBookingsByRoom', () => {
	it('returns bookings for a room', async () => {
		const mockRows = [
			{
				id: 'booking-uuid-1',
				room_id: 'room-uuid-1',
				guest_id: 'guest-uuid-1',
				check_in_date: '2026-03-01',
				check_out_date: '2026-03-05',
				nights_count: 4,
				booking_source: 'agoda',
				status: 'confirmed',
				created_by: 'staff-uuid-1',
				created_at: '2026-02-16T00:00:00Z',
				updated_at: '2026-02-16T00:00:00Z'
			}
		];
		mockOrder.mockResolvedValue({ data: mockRows, error: null });

		const supabase = makeMockSupabase();
		const result = await getBookingsByRoom(supabase, 'room-uuid-1');

		expect(result).toHaveLength(1);
		expect(result[0].room_id).toBe('room-uuid-1');
	});

	it('returns empty array when no bookings found', async () => {
		mockOrder.mockResolvedValue({ data: null, error: null });

		const supabase = makeMockSupabase();
		const result = await getBookingsByRoom(supabase, 'room-uuid-no-bookings');

		expect(result).toEqual([]);
	});

	it('throws when Supabase returns an error', async () => {
		mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } });

		const supabase = makeMockSupabase();
		await expect(getBookingsByRoom(supabase, 'room-uuid-1')).rejects.toThrow(
			'getBookingsByRoom failed: DB error'
		);
	});
});

// ── getAllBookings ─────────────────────────────────────────────────────────────

describe('getAllBookings', () => {
	it('returns all bookings ordered by created_at desc', async () => {
		const mockRows = [{ id: 'b2', created_at: '2026-03-02' }, { id: 'b1', created_at: '2026-03-01' }];
		mockOrder.mockResolvedValue({ data: mockRows, error: null });

		const supabase = makeMockSupabase();
		const result = await getAllBookings(supabase);

		expect(result).toHaveLength(2);
	});

	it('throws on Supabase error', async () => {
		mockOrder.mockResolvedValue({ data: null, error: { message: 'Query error' } });

		const supabase = makeMockSupabase();
		await expect(getAllBookings(supabase)).rejects.toThrow('getAllBookings failed: Query error');
	});
});
