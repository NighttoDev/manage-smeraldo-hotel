<script lang="ts">
	import BookingForm from '$lib/components/bookings/BookingForm.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Tạo đặt phòng mới — Smeraldo Hotel</title>
</svelte:head>

<!-- Skip link -->
<a href="#new-booking-form" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2">
	Bỏ qua điều hướng
</a>

<div class="mx-auto max-w-lg px-4 py-6">
	<!-- Back link -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		href="/bookings"
		class="mb-4 inline-flex items-center gap-1 font-sans text-sm text-gray-500 hover:text-gray-800"
	>
		← Quay lại
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->

	<h1 id="new-booking-form" class="mb-6 font-sans text-2xl font-bold text-gray-900">
		Tạo đặt phòng mới
	</h1>

	{#if data.rooms.length === 0}
		<div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
			<p class="font-sans text-sm text-amber-800">
				Không có phòng trống. Vui lòng kiểm tra trạng thái phòng trước khi đặt.
			</p>
		</div>
	{:else}
		<BookingForm rooms={data.rooms} form={data.form} />
	{/if}
</div>
