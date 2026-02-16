<script lang="ts">
	import { roomStatusCountsStore } from '$lib/stores/roomState';
	import { getOccupancyPercent, getOccupancyLabel, TOTAL_ROOMS } from './occupancyUtils';
	import type { RoomStatusCounts } from '$lib/stores/roomState';

	interface Props {
		/** Server-loaded counts — used as fallback before Realtime initialises */
		serverCounts: RoomStatusCounts;
	}

	let { serverCounts }: Props = $props();

	// Use Realtime-derived counts when the store is populated, otherwise fall back to server data
	let liveCounts = $derived(
		$roomStatusCountsStore.occupied + $roomStatusCountsStore.available +
		$roomStatusCountsStore.checking_out_today + $roomStatusCountsStore.being_cleaned +
		$roomStatusCountsStore.ready > 0
			? $roomStatusCountsStore
			: serverCounts
	);

	let occupiedCount = $derived(liveCounts.occupied);
	let percent = $derived(getOccupancyPercent(occupiedCount, TOTAL_ROOMS));
	let label = $derived(getOccupancyLabel(occupiedCount, TOTAL_ROOMS));
</script>

<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
	<!-- Header -->
	<div class="mb-4 flex items-center gap-2">
		<span class="text-xl">🏨</span>
		<h2 class="text-base font-semibold text-slate-700">Tình trạng phòng hôm nay</h2>
	</div>

	<!-- Main count -->
	<p class="mb-3 font-mono text-3xl font-bold text-room-occupied">
		{label}
	</p>

	<!-- Progress bar -->
	<div class="mb-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
		<div
			class="h-full rounded-full bg-room-occupied transition-all duration-500"
			style="width: {percent}%"
			role="progressbar"
			aria-valuenow={occupiedCount}
			aria-valuemin={0}
			aria-valuemax={TOTAL_ROOMS}
			aria-label="Tỷ lệ lấp đầy phòng"
		></div>
	</div>

	<p class="mb-4 text-right text-sm font-medium text-slate-500">{percent.toFixed(1)}%</p>

	<!-- Status breakdown chips -->
	<div class="flex flex-wrap gap-2 text-xs font-medium">
		<span class="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-room-occupied">
			<span class="h-2 w-2 rounded-full bg-room-occupied"></span>
			Có khách: {liveCounts.occupied}
		</span>
		<span class="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-room-checkout">
			<span class="h-2 w-2 rounded-full bg-room-checkout"></span>
			Check-out: {liveCounts.checking_out_today}
		</span>
		<span class="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-room-cleaning">
			<span class="h-2 w-2 rounded-full bg-room-cleaning"></span>
			Đang dọn: {liveCounts.being_cleaned}
		</span>
		<span class="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-room-ready">
			<span class="h-2 w-2 rounded-full bg-room-ready"></span>
			Sẵn sàng: {liveCounts.ready}
		</span>
		<span class="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-room-available">
			<span class="h-2 w-2 rounded-full bg-room-available"></span>
			Trống: {liveCounts.available}
		</span>
	</div>
</div>
