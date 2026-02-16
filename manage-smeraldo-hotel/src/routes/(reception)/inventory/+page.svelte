<script lang="ts">
	import InventoryList from '$lib/components/inventory/InventoryList.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let lowStockCount = $derived(
		data.items.filter((item) => item.current_stock <= item.low_stock_threshold).length
	);
</script>

<svelte:head>
	<title>Kho hàng — Smeraldo Hotel</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-6">
	<div class="mb-4">
		<h1 class="font-sans text-xl font-bold text-high-contrast">Kho hàng</h1>
		<div class="mt-1 flex items-center gap-2">
			<p class="font-sans text-sm text-gray-500">
				{data.items.length} sản phẩm
			</p>
			{#if lowStockCount > 0}
				<span
					class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-sans text-xs font-medium text-amber-800"
				>
					{lowStockCount} sắp hết
				</span>
			{/if}
		</div>
	</div>

	{#if data.items.length === 0}
		<div class="rounded-lg border border-gray-200 p-8 text-center">
			<p class="font-sans text-sm text-gray-500">Chưa có sản phẩm nào.</p>
		</div>
	{:else}
		<InventoryList items={data.items} />
	{/if}
</div>
