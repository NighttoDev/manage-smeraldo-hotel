import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('$lib/server/db/staff', () => ({
	getAllStaff: vi.fn(),
	createStaffAuthUser: vi.fn(),
	insertStaffMember: vi.fn()
}));

vi.mock('$lib/server/adminClient', () => ({
	createAdminClient: vi.fn(() => ({
		auth: {
			admin: {
				deleteUser: vi.fn().mockResolvedValue({ error: null })
			}
		}
	}))
}));

import { actions } from './+page.server';
import { createStaffAuthUser, insertStaffMember } from '$lib/server/db/staff';
import { createAdminClient } from '$lib/server/adminClient';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(fields: Record<string, string>): Request {
	const formData = new FormData();
	Object.entries(fields).forEach(([k, v]) => formData.set(k, v));
	return new Request('http://localhost/staff', { method: 'POST', body: formData });
}

function makeLocals() {
	return {
		supabase: {},
		userRole: 'manager',
		userFullName: 'Test Manager'
	} as unknown as App.Locals;
}

// ── createStaff action ────────────────────────────────────────────────────────

describe('createStaff action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 400 on invalid input (short password)', async () => {
		const request = makeRequest({
			full_name: 'Test User',
			email: 'test@test.com',
			password: 'short',
			role: 'reception'
		});

		const result = await actions.createStaff({
			request,
			locals: makeLocals()
		} as Parameters<typeof actions.createStaff>[0]);

		// SvelteKit fail() returns an object with a status and data property
		expect(result).toMatchObject({ status: 400 });
	});

	it('returns form with validation errors on invalid full_name', async () => {
		const request = makeRequest({
			full_name: 'A', // too short
			email: 'test@test.com',
			password: 'validpassword',
			role: 'reception'
		});

		const result = await actions.createStaff({
			request,
			locals: makeLocals()
		} as Parameters<typeof actions.createStaff>[0]);

		// Superforms wraps validation errors in { form: { errors: {...} } }
		expect(result).toMatchObject({ status: 400 });
		const resultData = (result as { data: { form: { errors: Record<string, unknown> } } }).data;
		expect(resultData.form.errors.full_name).toBeDefined();
	});

	it('returns form message error when auth user creation fails', async () => {
		vi.mocked(createStaffAuthUser).mockRejectedValueOnce(new Error('Email already in use'));

		const request = makeRequest({
			full_name: 'Valid Name',
			email: 'existing@test.com',
			password: 'validpassword',
			role: 'reception'
		});

		const result = await actions.createStaff({
			request,
			locals: makeLocals()
		} as Parameters<typeof actions.createStaff>[0]);

		// message(form, ..., { status: 400 }) returns ActionResult with form.message
		const resultData = (result as { data: { form: { message: { type: string; text: string } } } })
			.data;
		expect(resultData.form.message.type).toBe('error');
		expect(resultData.form.message.text).toBe('Email already in use');
	});

	it('rolls back auth user and returns 500 when DB insert fails', async () => {
		const mockDeleteUser = vi.fn().mockResolvedValue({ error: null });
		vi.mocked(createAdminClient).mockReturnValueOnce({
			auth: { admin: { deleteUser: mockDeleteUser } }
		} as unknown as ReturnType<typeof createAdminClient>);
		vi.mocked(createStaffAuthUser).mockResolvedValueOnce({ userId: 'new-uuid' });
		vi.mocked(insertStaffMember).mockRejectedValueOnce(new Error('Insert failed'));

		const request = makeRequest({
			full_name: 'Valid Name',
			email: 'new@test.com',
			password: 'validpassword',
			role: 'reception'
		});

		const result = await actions.createStaff({
			request,
			locals: makeLocals()
		} as Parameters<typeof actions.createStaff>[0]);

		// Should have attempted rollback
		expect(mockDeleteUser).toHaveBeenCalledWith('new-uuid');
		// Should return 500 with error message
		const resultData = (result as { data: { form: { message: { type: string; text: string } } } })
			.data;
		expect(resultData.form.message.type).toBe('error');
		expect(resultData.form.message.text).toContain('Không thể tạo hồ sơ nhân viên');
	});

	it('returns form with success message on successful creation', async () => {
		vi.mocked(createStaffAuthUser).mockResolvedValueOnce({ userId: 'new-uuid' });
		vi.mocked(insertStaffMember).mockResolvedValueOnce({
			id: 'new-uuid',
			full_name: 'Valid Name',
			role: 'reception',
			is_active: true,
			created_at: '2026-02-15T00:00:00Z',
			updated_at: '2026-02-15T00:00:00Z'
		});

		const request = makeRequest({
			full_name: 'Valid Name',
			email: 'new@test.com',
			password: 'validpassword',
			role: 'reception'
		});

		const result = await actions.createStaff({
			request,
			locals: makeLocals()
		} as Parameters<typeof actions.createStaff>[0]);

		// Superforms message() returns { form } directly (not wrapped in fail()) for 2xx
		const resultData = result as { form: { message: { type: string; text: string } } };
		expect(resultData.form.message.type).toBe('success');
	});
});
