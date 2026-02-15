import { describe, it, expect, vi } from 'vitest';
import {
	getAllStaff,
	getStaffById,
	createStaffAuthUser,
	insertStaffMember,
	updateStaffMember
} from './staff';

// ── getAllStaff ────────────────────────────────────────────────────────────────

describe('getAllStaff', () => {
	it('returns array of staff members on success', async () => {
		const mockStaff = [
			{
				id: 'uuid-1',
				full_name: 'Nguyễn Văn A',
				role: 'manager',
				is_active: true,
				created_at: '2026-01-01T00:00:00Z',
				updated_at: '2026-01-01T00:00:00Z'
			},
			{
				id: 'uuid-2',
				full_name: 'Trần Thị B',
				role: 'reception',
				is_active: true,
				created_at: '2026-01-02T00:00:00Z',
				updated_at: '2026-01-02T00:00:00Z'
			}
		];

		// Construct a chain that ends with order() returning the mock data
		const orderMock = vi.fn().mockResolvedValue({ data: mockStaff, error: null });
		const selectMock = vi.fn().mockReturnValue({ order: orderMock });
		const supabase = { from: vi.fn().mockReturnValue({ select: selectMock }) } as unknown as Parameters<typeof getAllStaff>[0];

		const result = await getAllStaff(supabase);
		expect(result).toHaveLength(2);
		expect(result[0].full_name).toBe('Nguyễn Văn A');
	});

	it('returns empty array when no staff exist', async () => {
		const orderMock = vi.fn().mockResolvedValue({ data: null, error: null });
		const selectMock = vi.fn().mockReturnValue({ order: orderMock });
		const supabase = { from: vi.fn().mockReturnValue({ select: selectMock }) } as unknown as Parameters<typeof getAllStaff>[0];

		const result = await getAllStaff(supabase);
		expect(result).toEqual([]);
	});

	it('throws on database error', async () => {
		const orderMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
		const selectMock = vi.fn().mockReturnValue({ order: orderMock });
		const supabase = { from: vi.fn().mockReturnValue({ select: selectMock }) } as unknown as Parameters<typeof getAllStaff>[0];

		await expect(getAllStaff(supabase)).rejects.toThrow('Failed to fetch staff');
	});
});

// ── getStaffById ──────────────────────────────────────────────────────────────

describe('getStaffById', () => {
	it('returns staff member when found', async () => {
		const mockStaff = {
			id: 'uuid-1',
			full_name: 'Nguyễn Văn A',
			role: 'manager',
			is_active: true,
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-01-01T00:00:00Z'
		};
		const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockStaff, error: null });
		const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
		const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
		const supabase = { from: vi.fn().mockReturnValue({ select: selectMock }) } as unknown as Parameters<typeof getStaffById>[0];

		const result = await getStaffById(supabase, 'uuid-1');
		expect(result).not.toBeNull();
		expect(result?.full_name).toBe('Nguyễn Văn A');
	});

	it('returns null when staff not found', async () => {
		const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
		const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
		const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
		const supabase = { from: vi.fn().mockReturnValue({ select: selectMock }) } as unknown as Parameters<typeof getStaffById>[0];

		const result = await getStaffById(supabase, 'nonexistent-id');
		expect(result).toBeNull();
	});
});

// ── createStaffAuthUser ───────────────────────────────────────────────────────

describe('createStaffAuthUser', () => {
	it('returns userId on success', async () => {
		const adminClient = {
			auth: {
				admin: {
					createUser: vi.fn().mockResolvedValue({
						data: { user: { id: 'new-uuid-123' } },
						error: null
					}),
					deleteUser: vi.fn().mockResolvedValue({ error: null })
				}
			}
		};

		const result = await createStaffAuthUser(adminClient, 'test@example.com', 'password123');
		expect(result.userId).toBe('new-uuid-123');
	});

	it('throws on auth error', async () => {
		const adminClient = {
			auth: {
				admin: {
					createUser: vi.fn().mockResolvedValue({
						data: null,
						error: { message: 'Email already in use' }
					}),
					deleteUser: vi.fn().mockResolvedValue({ error: null })
				}
			}
		};

		await expect(
			createStaffAuthUser(adminClient, 'existing@example.com', 'password123')
		).rejects.toThrow('Email already in use');
	});
});

// ── insertStaffMember ─────────────────────────────────────────────────────────

describe('insertStaffMember', () => {
	it('returns inserted staff member on success', async () => {
		const inserted = {
			id: 'uuid-new',
			full_name: 'Lê Văn C',
			role: 'reception',
			is_active: true,
			created_at: '2026-02-15T00:00:00Z',
			updated_at: '2026-02-15T00:00:00Z'
		};
		const singleMock = vi.fn().mockResolvedValue({ data: inserted, error: null });
		const selectMock = vi.fn().mockReturnValue({ single: singleMock });
		const insertMock = vi.fn().mockReturnValue({ select: selectMock });
		const supabase = { from: vi.fn().mockReturnValue({ insert: insertMock }) } as unknown as Parameters<typeof insertStaffMember>[0];

		const result = await insertStaffMember(supabase, 'uuid-new', 'Lê Văn C', 'reception');
		expect(result.full_name).toBe('Lê Văn C');
		expect(result.role).toBe('reception');
	});

	it('throws on insert failure', async () => {
		const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } });
		const selectMock = vi.fn().mockReturnValue({ single: singleMock });
		const insertMock = vi.fn().mockReturnValue({ select: selectMock });
		const supabase = { from: vi.fn().mockReturnValue({ insert: insertMock }) } as unknown as Parameters<typeof insertStaffMember>[0];

		await expect(insertStaffMember(supabase, 'id', 'Name', 'reception')).rejects.toThrow(
			'Insert failed'
		);
	});
});

// ── updateStaffMember ─────────────────────────────────────────────────────────

describe('updateStaffMember', () => {
	it('returns updated staff member on success', async () => {
		const updated = {
			id: 'uuid-1',
			full_name: 'Updated Name',
			role: 'housekeeping',
			is_active: false,
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-02-15T00:00:00Z'
		};
		const singleMock = vi.fn().mockResolvedValue({ data: updated, error: null });
		const selectMock = vi.fn().mockReturnValue({ single: singleMock });
		const eqMock = vi.fn().mockReturnValue({ select: selectMock });
		const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
		const supabase = { from: vi.fn().mockReturnValue({ update: updateMock }) } as unknown as Parameters<typeof updateStaffMember>[0];

		const result = await updateStaffMember(supabase, 'uuid-1', {
			full_name: 'Updated Name',
			role: 'housekeeping',
			is_active: false
		});
		expect(result.full_name).toBe('Updated Name');
		expect(result.is_active).toBe(false);
	});

	it('throws on update failure', async () => {
		const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } });
		const selectMock = vi.fn().mockReturnValue({ single: singleMock });
		const eqMock = vi.fn().mockReturnValue({ select: selectMock });
		const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
		const supabase = { from: vi.fn().mockReturnValue({ update: updateMock }) } as unknown as Parameters<typeof updateStaffMember>[0];

		await expect(updateStaffMember(supabase, 'uuid-1', { is_active: false })).rejects.toThrow(
			'Update failed'
		);
	});
});
