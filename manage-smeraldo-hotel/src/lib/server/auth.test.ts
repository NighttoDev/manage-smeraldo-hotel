import { describe, it, expect, vi } from 'vitest';
import { requireRole } from './auth';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Creates a mock App.Locals with a pre-set userRole and a valid session */
function makeMockLocals(userRole: string | null, userFullName = 'Test User') {
	return {
		userRole,
		userFullName,
		supabase: {
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: { id: 'uuid-test' } },
					error: null
				}),
				getSession: vi.fn().mockResolvedValue({
					data: {
						session: { expires_at: 9999999999, user: { id: 'uuid-test' } }
					}
				})
			},
			from: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnThis(),
				eq: vi.fn().mockReturnThis(),
				single: vi.fn().mockResolvedValue({
					data: { role: userRole, full_name: userFullName, is_active: true },
					error: null
				})
			})
		},
		safeGetSession: vi.fn().mockResolvedValue({
			session: { expires_at: 9999999999, user: { id: 'uuid-test' } },
			user: { id: 'uuid-test' }
		})
	} as unknown as App.Locals;
}

// ── requireRole ───────────────────────────────────────────────────────────────

describe('requireRole', () => {
	it('passes when manager role matches allowed roles ["manager"]', async () => {
		const locals = makeMockLocals('manager');
		await expect(requireRole(locals, ['manager'])).resolves.toMatchObject({ role: 'manager' });
	});

	it('throws 403 when reception tries to access manager-only route', async () => {
		const locals = makeMockLocals('reception');
		await expect(requireRole(locals, ['manager'])).rejects.toMatchObject({ status: 403 });
	});

	it('throws 403 when housekeeping tries to access manager-only route', async () => {
		const locals = makeMockLocals('housekeeping');
		await expect(requireRole(locals, ['manager'])).rejects.toMatchObject({ status: 403 });
	});

	it('passes when reception role matches allowed roles ["reception", "manager"]', async () => {
		const locals = makeMockLocals('reception');
		await expect(requireRole(locals, ['reception', 'manager'])).resolves.toMatchObject({
			role: 'reception'
		});
	});

	it('passes when manager role matches allowed roles ["reception", "manager"]', async () => {
		const locals = makeMockLocals('manager');
		await expect(requireRole(locals, ['reception', 'manager'])).resolves.toMatchObject({
			role: 'manager'
		});
	});

	it('throws 403 when housekeeping tries to access reception route', async () => {
		const locals = makeMockLocals('housekeeping');
		await expect(requireRole(locals, ['reception', 'manager'])).rejects.toMatchObject({
			status: 403
		});
	});

	it('passes when housekeeping role matches allowed roles ["housekeeping", "manager"]', async () => {
		const locals = makeMockLocals('housekeeping');
		await expect(requireRole(locals, ['housekeeping', 'manager'])).resolves.toMatchObject({
			role: 'housekeeping'
		});
	});

	it('throws 403 when reception tries to access housekeeping route', async () => {
		const locals = makeMockLocals('reception');
		await expect(requireRole(locals, ['housekeeping', 'manager'])).rejects.toMatchObject({
			status: 403
		});
	});
});

// ── requireRole slow path (locals.userRole = null) ────────────────────────────

describe('requireRole slow path (DB fallback)', () => {
	/** Creates mock locals with userRole=null so requireRole falls back to DB query */
	function makeMockLocalsNullRole(dbRole: string) {
		return {
			userRole: null,
			userFullName: null,
			supabase: {
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: 'uuid-test' } },
						error: null
					}),
					getSession: vi.fn().mockResolvedValue({
						data: {
							session: { expires_at: 9999999999, user: { id: 'uuid-test' } }
						}
					})
				},
				from: vi.fn().mockReturnValue({
					select: vi.fn().mockReturnThis(),
					eq: vi.fn().mockReturnThis(),
					single: vi.fn().mockResolvedValue({
						data: { role: dbRole, full_name: 'DB User', is_active: true },
						error: null
					})
				})
			},
			safeGetSession: vi.fn().mockResolvedValue({
				session: { expires_at: 9999999999, user: { id: 'uuid-test' } },
				user: { id: 'uuid-test' }
			})
		} as unknown as App.Locals;
	}

	it('falls back to DB and passes when DB role matches allowed roles', async () => {
		const locals = makeMockLocalsNullRole('manager');
		await expect(requireRole(locals, ['manager'])).resolves.toMatchObject({ role: 'manager' });
	});

	it('falls back to DB and throws 403 when DB role is not in allowed roles', async () => {
		const locals = makeMockLocalsNullRole('reception');
		await expect(requireRole(locals, ['manager'])).rejects.toMatchObject({ status: 403 });
	});

	it('falls back to DB and throws 403 when profile is not found', async () => {
		const locals = {
			userRole: null,
			userFullName: null,
			supabase: {
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: 'uuid-test' } },
						error: null
					}),
					getSession: vi.fn().mockResolvedValue({
						data: {
							session: { expires_at: 9999999999, user: { id: 'uuid-test' } }
						}
					})
				},
				from: vi.fn().mockReturnValue({
					select: vi.fn().mockReturnThis(),
					eq: vi.fn().mockReturnThis(),
					single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
				})
			},
			safeGetSession: vi.fn().mockResolvedValue({
				session: { expires_at: 9999999999, user: { id: 'uuid-test' } },
				user: { id: 'uuid-test' }
			})
		} as unknown as App.Locals;
		await expect(requireRole(locals, ['manager'])).rejects.toMatchObject({ status: 403 });
	});
});
