<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { CheckInSchema } from '$lib/db/schema';
	import { formatDateVN } from '$lib/utils/formatDate';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { CheckIn, BookingWithGuest } from '$lib/db/schema';

	interface Props {
		booking: BookingWithGuest | null;
		checkInForm: SuperValidated<CheckIn>;
		onclose: () => void;
	}

	let { booking, checkInForm, onclose }: Props = $props();

	const { form: formData, errors, enhance, submitting, message, reset } = superForm(checkInForm, {
		validators: zod4(CheckInSchema),
		onUpdated: ({ form }) => {
			if (form.message?.type === 'success') onclose();
		}
	});

	// Reset form (clears errors + messages) and populate fields when booking changes
	$effect(() => {
		if (booking) {
			reset({
				data: {
					booking_id: booking.id,
					room_id: booking.room_id,
					guest_id: booking.guest.id,
					guest_name: booking.guest.full_name,
					check_in_date: booking.check_in_date,
					check_out_date: booking.check_out_date
				},
				keepMessage: false
			});
		}
	});

	const sourceLabels: Record<string, string> = {
		agoda: 'Agoda',
		booking_com: 'Booking.com',
		trip_com: 'Trip.com',
		facebook: 'Facebook',
		walk_in: 'Khách vãng lai'
	};
</script>

{#if booking}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-40 cursor-default bg-black/50"
		onclick={onclose}
		aria-label="Đóng hộp thoại"
		tabindex="-1"
		disabled={$submitting}
	></button>

	<!-- Dialog -->
	<div
		class="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl sm:inset-x-auto"
		role="dialog"
		aria-modal="true"
		aria-labelledby="checkin-title"
	>
		<h3 id="checkin-title" class="font-sans text-lg font-bold text-gray-900">
			Check-in phòng {booking.room_id}
		</h3>

		<!-- Server message -->
		{#if $message}
			<div
				class="mt-3 rounded-lg px-3 py-2 font-sans text-sm {$message.type === 'error'
					? 'bg-red-50 text-red-700'
					: 'bg-green-50 text-green-700'}"
				role="alert"
			>
				{$message.text}
			</div>
		{/if}

		<form method="POST" action="?/checkIn" use:enhance class="mt-4 flex flex-col gap-4">
			<!-- Hidden fields -->
			<input type="hidden" name="booking_id" value={$formData.booking_id} />
			<input type="hidden" name="room_id" value={$formData.room_id} />
			<input type="hidden" name="guest_id" value={$formData.guest_id} />
			<input type="hidden" name="check_in_date" value={$formData.check_in_date} />
			<input type="hidden" name="check_out_date" value={$formData.check_out_date} />

			<!-- Editable guest name -->
			<div class="flex flex-col gap-1">
				<label for="checkin-guest-name" class="font-sans text-sm font-medium text-gray-700">
					Tên khách <span class="text-red-500" aria-hidden="true">*</span>
				</label>
				<input
					id="checkin-guest-name"
					name="guest_name"
					type="text"
					bind:value={$formData.guest_name}
					autocomplete="off"
					aria-required="true"
					aria-invalid={!!$errors.guest_name}
					aria-describedby={$errors.guest_name ? 'checkin-name-error' : undefined}
					disabled={$submitting}
					class="h-12 rounded-lg border px-3 font-sans text-sm text-gray-900 focus:outline-none focus:ring-2 disabled:bg-gray-50 motion-reduce:transition-none
					{$errors.guest_name
						? 'border-red-400 focus:ring-red-300'
						: 'border-gray-300 focus:ring-primary/40'}"
				/>
				{#if $errors.guest_name}
					<p id="checkin-name-error" class="font-sans text-xs text-red-600" role="alert">
						{$errors.guest_name}
					</p>
				{/if}
			</div>

			<!-- Read-only booking details -->
			<div class="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 px-4 py-3">
				<div>
					<p class="font-sans text-xs text-gray-500">Check-in</p>
					<p class="font-sans text-sm font-medium text-gray-900">
						{formatDateVN(booking.check_in_date)}
					</p>
				</div>
				<div>
					<p class="font-sans text-xs text-gray-500">Check-out</p>
					<p class="font-sans text-sm font-medium text-gray-900">
						{formatDateVN(booking.check_out_date)}
					</p>
				</div>
				<div>
					<p class="font-sans text-xs text-gray-500">Số đêm</p>
					<p class="font-sans text-sm font-medium text-gray-900">{booking.nights_count}</p>
				</div>
				<div>
					<p class="font-sans text-xs text-gray-500">Nguồn</p>
					<p class="font-sans text-sm font-medium text-gray-900">
						{booking.booking_source ? (sourceLabels[booking.booking_source] ?? booking.booking_source) : '—'}
					</p>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-3 pt-1">
				<button
					type="button"
					onclick={onclose}
					disabled={$submitting}
					class="min-h-[48px] flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-sans text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
					>
					Hủy
					</button>
					<button
					type="submit"
					disabled={$submitting}
					class="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
				>
					{#if $submitting}
						<span
							class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent motion-reduce:animate-none"
							aria-hidden="true"
						></span>
						Đang xử lý...
					{:else}
						Xác nhận check-in
					{/if}
				</button>
			</div>
		</form>
	</div>
{/if}
