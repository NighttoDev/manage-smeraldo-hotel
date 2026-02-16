import { describe, it, expect } from 'vitest';
import { CreateStaffSchema, UpdateStaffSchema } from './schema';

// ── CreateStaffSchema ─────────────────────────────────────────────────────────

describe('CreateStaffSchema', () => {
	it('accepts valid data', () => {
		const result = CreateStaffSchema.safeParse({
			full_name: 'Nguyễn Văn A',
			email: 'nva@smeraldo.vn',
			password: 'password123',
			role: 'manager'
		});
		expect(result.success).toBe(true);
	});

	it('rejects password shorter than 8 characters', () => {
		const result = CreateStaffSchema.safeParse({
			full_name: 'Test User',
			email: 'test@test.com',
			password: 'short',
			role: 'reception'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const passwordError = result.error.issues.find((e) => e.path[0] === 'password');
			expect(passwordError).toBeDefined();
			expect(passwordError?.message).toContain('8 ký tự');
		}
	});

	it('rejects invalid email format', () => {
		const result = CreateStaffSchema.safeParse({
			full_name: 'Test User',
			email: 'not-an-email',
			password: 'validpassword',
			role: 'reception'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const emailError = result.error.issues.find((e) => e.path[0] === 'email');
			expect(emailError).toBeDefined();
		}
	});

	it('rejects invalid role value', () => {
		const result = CreateStaffSchema.safeParse({
			full_name: 'Test User',
			email: 'test@test.com',
			password: 'validpassword',
			role: 'admin' // not a valid role
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const roleError = result.error.issues.find((e) => e.path[0] === 'role');
			expect(roleError).toBeDefined();
		}
	});

	it('rejects full_name shorter than 2 characters', () => {
		const result = CreateStaffSchema.safeParse({
			full_name: 'A',
			email: 'test@test.com',
			password: 'validpassword',
			role: 'reception'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const nameError = result.error.issues.find((e) => e.path[0] === 'full_name');
			expect(nameError).toBeDefined();
		}
	});

	it('accepts all three valid roles', () => {
		const roles = ['manager', 'reception', 'housekeeping'] as const;
		roles.forEach((role) => {
			const result = CreateStaffSchema.safeParse({
				full_name: 'Test User',
				email: 'test@test.com',
				password: 'validpassword',
				role
			});
			expect(result.success).toBe(true);
		});
	});
});

// ── UpdateStaffSchema ─────────────────────────────────────────────────────────

describe('UpdateStaffSchema', () => {
	it('accepts valid update data', () => {
		const result = UpdateStaffSchema.safeParse({
			full_name: 'Trần Thị B',
			role: 'housekeeping',
			is_active: false
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.is_active).toBe(false);
		}
	});

	it('accepts is_active = true', () => {
		const result = UpdateStaffSchema.safeParse({
			full_name: 'Valid Name',
			role: 'reception',
			is_active: true
		});
		expect(result.success).toBe(true);
	});

	it('rejects full_name shorter than 2 characters', () => {
		const result = UpdateStaffSchema.safeParse({
			full_name: 'X',
			role: 'reception',
			is_active: true
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid role', () => {
		const result = UpdateStaffSchema.safeParse({
			full_name: 'Valid Name',
			role: 'superadmin',
			is_active: true
		});
		expect(result.success).toBe(false);
	});
});
