import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { getAllStaff, createStaffAuthUser, insertStaffMember } from '$lib/server/db/staff';
import { createAdminClient } from '$lib/server/adminClient';
import { CreateStaffSchema } from '$lib/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	// RBAC already enforced by (manager)/+layout.server.ts — user is guaranteed manager here
	const [staff, form] = await Promise.all([
		getAllStaff(locals.supabase),
		superValidate(zod4(CreateStaffSchema))
	]);
	return { staff, form };
};

export const actions: Actions = {
	createStaff: async ({ locals, request }) => {
		const form = await superValidate(request, zod4(CreateStaffSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Step 1: Create Supabase auth user via admin API
		const adminClient = createAdminClient();
		let userId: string;
		try {
			const result = await createStaffAuthUser(adminClient, form.data.email, form.data.password);
			userId = result.userId;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Không thể tạo tài khoản';
			return message(form, { type: 'error', text: errorMessage }, { status: 400 });
		}

		// Step 2: Insert staff_members record (rollback auth user if this fails)
		try {
			await insertStaffMember(locals.supabase, userId, form.data.full_name, form.data.role);
		} catch {
			// Rollback: delete the auth user to avoid orphaned records
			await adminClient.auth.admin.deleteUser(userId).catch(() => {
				// Log rollback failure but don't surface to user
				console.error('Failed to rollback auth user after staff_members insert failure');
			});
			return message(
				form,
				{ type: 'error', text: 'Không thể tạo hồ sơ nhân viên. Vui lòng thử lại.' },
				{ status: 500 }
			);
		}

		return message(form, { type: 'success', text: 'Tạo tài khoản thành công.' });
	}
};
