import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { getAllRooms, updateRoomStatus, getRoomById, insertRoomStatusLog } from '$lib/server/db/rooms';
import type { RoomStatus } from '$lib/server/db/rooms';
import { getTodaysBookings, checkInBooking } from '$lib/server/db/bookings';
import { CheckInSchema } from '$lib/db/schema';

/** Returns YYYY-MM-DD in Vietnam timezone (UTC+7) */
function dateInVN(): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

const OverrideStatusSchema = z.object({
	room_id: z.string().uuid(),
	new_status: z.enum(['available', 'occupied', 'checking_out_today', 'being_cleaned', 'ready'])
});

export const load: PageServerLoad = async ({ locals }) => {
	const today = dateInVN();

	const [rooms, todaysBookings, overrideForm, checkInForm] = await Promise.all([
		getAllRooms(locals.supabase),
		getTodaysBookings(locals.supabase, today),
		superValidate(zod4(OverrideStatusSchema)),
		superValidate(zod4(CheckInSchema))
	]);

	return { rooms, todaysBookings, overrideForm, checkInForm };
};

export const actions: Actions = {
	overrideStatus: async ({ locals, request }) => {
		const form = await superValidate(request, zod4(OverrideStatusSchema));

		if (!form.valid) {
			return fail(400, { overrideForm: form });
		}

		const { room_id, new_status } = form.data;

		const room = await getRoomById(locals.supabase, room_id);
		if (!room) {
			return message(form, { type: 'error', text: 'Không tìm thấy phòng' }, { status: 404 });
		}

		const { user } = await locals.safeGetSession();
		if (!user) return message(form, { type: 'error', text: 'Phiên đăng nhập hết hạn' }, { status: 401 });

		const previousStatus = room.status;

		try {
			await updateRoomStatus(locals.supabase, room_id, new_status as RoomStatus);
			await insertRoomStatusLog(
				locals.supabase,
				room_id,
				previousStatus,
				new_status as RoomStatus,
				user.id
			);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
			return message(form, { type: 'error', text: errorMessage }, { status: 500 });
		}

		return message(form, { type: 'success', text: 'Đã cập nhật trạng thái phòng' });
	},

	checkIn: async ({ locals, request }) => {
		const form = await superValidate(request, zod4(CheckInSchema));

		if (!form.valid) {
			return fail(400, { checkInForm: form });
		}

		const { booking_id, room_id, guest_id, guest_name } = form.data;

		const { user } = await locals.safeGetSession();
		if (!user) {
			return message(form, { type: 'error', text: 'Phiên đăng nhập hết hạn' }, { status: 401 });
		}

		const room = await getRoomById(locals.supabase, room_id);
		if (!room) {
			return message(form, { type: 'error', text: 'Không tìm thấy phòng' }, { status: 404 });
		}

		const previousStatus = room.status;

		try {
			// Step 1: update booking status + guest name
			await checkInBooking(locals.supabase, booking_id, guest_id, guest_name);

			// Step 2: update room status → occupied with guest name (triggers Realtime)
			await updateRoomStatus(locals.supabase, room_id, 'occupied', guest_name);

			// Step 3: audit trail
			await insertRoomStatusLog(locals.supabase, room_id, previousStatus, 'occupied', user.id);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Không thể check-in';
			return message(form, { type: 'error', text: errorMessage }, { status: 500 });
		}

		return message(form, { type: 'success', text: 'Check-in thành công' });
	}
};
