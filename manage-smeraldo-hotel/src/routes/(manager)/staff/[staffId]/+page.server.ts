import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { getStaffById, updateStaffMember } from '$lib/server/db/staff';
import { UpdateStaffSchema } from '$lib/db/schema';

export const load: PageServerLoad = async ({ locals, params }) => {
	// RBAC already enforced by (manager)/+layout.server.ts
	const staff = await getStaffById(locals.supabase, params.staffId);

	if (!staff) {
		error(404, 'Nhân viên không tồn tại');
	}

	const form = await superValidate(
		{ full_name: staff.full_name, role: staff.role, is_active: staff.is_active },
		zod4(UpdateStaffSchema)
	);

	return { staff, form };
};

export const actions: Actions = {
	updateStaff: async ({ locals, params, request }) => {
		const form = await superValidate(request, zod4(UpdateStaffSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await updateStaffMember(locals.supabase, params.staffId, form.data);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật nhân viên';
			return message(form, { type: 'error', text: errorMessage }, { status: 500 });
		}

		return message(form, { type: 'success', text: 'Đã cập nhật thông tin nhân viên.' });
	},

	deactivateStaff: async ({ locals, params }) => {
		try {
			await updateStaffMember(locals.supabase, params.staffId, { is_active: false });
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Không thể vô hiệu hóa tài khoản';
			return fail(500, { deactivateError: errorMessage });
		}

		redirect(303, '/staff');
	}
};
