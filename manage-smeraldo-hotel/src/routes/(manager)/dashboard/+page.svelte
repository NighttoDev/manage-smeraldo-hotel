<script lang="ts">
	import OccupancyWidget from '$lib/components/reports/OccupancyWidget.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/** Format today's date for display using Vietnamese locale */
	let todayDisplay = $derived(
		new Intl.DateTimeFormat('vi-VN', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date(data.today + 'T00:00:00'))
	);

	/** Shift value display map */
	const shiftLabel: Record<number, string> = {
		0: 'Vắng',
		0.5: 'Nửa ca',
		1: 'Đủ ca',
		1.5: 'Tăng ca'
	};

	/** Tailwind classes per shift value */
	const shiftClass: Record<number, string> = {
		0: 'bg-red-50 text-red-700',
		0.5: 'bg-amber-50 text-amber-700',
		1: 'bg-green-50 text-green-700',
		1.5: 'bg-blue-50 text-blue-700'
	};
</script>

<svelte:head>
	<title>Dashboard — Smeraldo Hotel</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-6 md:px-6">
	<!-- Page header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-slate-800">Dashboard quản lý</h1>
		<p class="mt-1 text-sm text-slate-500 capitalize">{todayDisplay}</p>
	</div>

	<!-- KPI grid: single column on mobile, two columns on md+ -->
	<div class="grid grid-cols-1 gap-5 md:grid-cols-2">

		<!-- Occupancy widget — spans full width on mobile, half on desktop -->
		<div class="md:col-span-2 lg:col-span-1">
			<OccupancyWidget serverCounts={data.statusCounts} />
		</div>

		<!-- Attendance summary widget -->
		<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2 lg:col-span-1">
			<div class="mb-4 flex items-center gap-2">
				<span class="text-xl">👥</span>
				<h2 class="text-base font-semibold text-slate-700">Chấm công hôm nay</h2>
			</div>

			{#if data.activeStaff.length === 0}
				<p class="text-sm text-slate-400">Chưa có nhân viên nào.</p>
			{:else}
				<div class="overflow-hidden rounded-lg border border-slate-100">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
								<th class="px-4 py-2">Nhân viên</th>
								<th class="px-4 py-2 text-right">Ca làm việc</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-50">
							{#each data.activeStaff as staff (staff.id)}
								{@const shiftValue = data.attendanceToday[staff.id] ?? 0}
								<tr class="hover:bg-slate-50/50">
									<td class="px-4 py-3 font-medium text-slate-700">{staff.full_name}</td>
									<td class="px-4 py-3 text-right">
										<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {shiftClass[shiftValue] ?? 'bg-slate-50 text-slate-600'}">
											{shiftLabel[shiftValue] ?? String(shiftValue)}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

	</div>
</div>
