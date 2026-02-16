// Server-only — never import from .svelte components
import type { SupabaseClient } from '@supabase/supabase-js';
import type { StaffRole } from '$lib/server/auth';

/** Minimal interface for the Supabase admin client — only the operations we actually call */
export interface StaffAdminClient {
	auth: {
		admin: {
			createUser: (params: {
				email: string;
				password: string;
				email_confirm: boolean;
			}) => Promise<{
				data: { user: { id: string } | null } | null;
				error: { message: string } | null;
			}>;
			deleteUser: (id: string) => Promise<{ error: { message: string } | null }>;
		};
	};
}

export interface StaffMemberRow {
	id: string;
	full_name: string;
	role: StaffRole;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface CreateStaffAuthResult {
	userId: string;
}

export interface StaffUpdateData {
	full_name?: string;
	role?: StaffRole;
	is_active?: boolean;
}

/**
 * Fetch all staff members ordered by creation date (oldest first).
 */
export async function getAllStaff(supabase: SupabaseClient): Promise<StaffMemberRow[]> {
	const { data, error } = await supabase
		.from('staff_members')
		.select('id, full_name, role, is_active, created_at, updated_at')
		.order('created_at', { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch staff: ${error.message}`);
	}

	return (data ?? []) as StaffMemberRow[];
}

/**
 * Fetch a single staff member by ID. Returns null if not found.
 */
export async function getStaffById(
	supabase: SupabaseClient,
	id: string
): Promise<StaffMemberRow | null> {
	const { data, error } = await supabase
		.from('staff_members')
		.select('id, full_name, role, is_active, created_at, updated_at')
		.eq('id', id)
		.maybeSingle();

	if (error) {
		throw new Error(`Failed to fetch staff member: ${error.message}`);
	}

	return data as StaffMemberRow | null;
}

/**
 * Create a new Supabase Auth user via the admin API.
 * email_confirm is set to true — internal hotel staff don't need email verification.
 * Returns the new user's UUID on success, or throws on failure.
 */
export async function createStaffAuthUser(
	adminClient: StaffAdminClient,
	email: string,
	password: string
): Promise<CreateStaffAuthResult> {
	const { data, error } = await adminClient.auth.admin.createUser({
		email,
		password,
		email_confirm: true
	});

	if (error || !data?.user) {
		throw new Error(error?.message ?? 'Failed to create auth user');
	}

	return { userId: data.user.id };
}

/**
 * Insert a new record into staff_members after auth user is created.
 * Returns the inserted row on success.
 */
export async function insertStaffMember(
	supabase: SupabaseClient,
	id: string,
	full_name: string,
	role: StaffRole
): Promise<StaffMemberRow> {
	const { data, error } = await supabase
		.from('staff_members')
		.insert({ id, full_name, role })
		.select()
		.single();

	if (error || !data) {
		throw new Error(error?.message ?? 'Failed to insert staff member');
	}

	return data as StaffMemberRow;
}

/**
 * Update a staff member's mutable fields (full_name, role, is_active).
 * Also sets updated_at to now() via the database trigger.
 */
export async function updateStaffMember(
	supabase: SupabaseClient,
	id: string,
	updates: StaffUpdateData
): Promise<StaffMemberRow> {
	const { data, error } = await supabase
		.from('staff_members')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error || !data) {
		throw new Error(error?.message ?? 'Failed to update staff member');
	}

	return data as StaffMemberRow;
}
