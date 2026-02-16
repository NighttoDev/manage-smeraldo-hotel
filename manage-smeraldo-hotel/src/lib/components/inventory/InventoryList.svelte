<script lang="ts">
	import type { InventoryItemRow } from '$lib/types/inventory';

	interface Props {
		items: InventoryItemRow[];
	}

	let { items }: Props = $props();

	function isLowStock(item: InventoryItemRow): boolean {
		return item.current_stock <= item.low_stock_threshold;
	}

	let groupedItems = $derived.by(() => {
		const groups = new Map<string, InventoryItemRow[]>();
		for (const item of items) {
			const existing = groups.get(item.category) ?? [];
			existing.push(item);
			groups.set(item.category, existing);
		}
		return groups;
	});
</script>

<!-- Desktop table (hidden on mobile) -->
<div class="hidden md:block">
	<div class="overflow-x-auto rounded-lg border border-gray-200">
		<table class="min-w-full border-collapse">
			<thead>
				<tr class="bg-gray-50">
					<th
						scope="col"
						class="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-600"
					>
						Sản phẩm
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-600"
					>
						Danh mục
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-right font-sans text-xs font-semibold text-gray-600"
					>
						Tồn kho
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-600"
					>
						Đơn vị
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-right font-sans text-xs font-semibold text-gray-600"
					>
						Ngưỡng
					</th>
					<th
						scope="col"
						class="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-600"
					>
						Trạng thái
					</th>
				</tr>
			</thead>
			<tbody>
				{#each items as item (item.id)}
					<tr
						class="border-b border-gray-100 hover:bg-gray-50/50
							{isLowStock(item) ? 'bg-amber-50/50' : ''}"
					>
						<th
							scope="row"
							class="px-4 py-3 text-left font-sans text-sm font-medium text-gray-900"
						>
							{item.name}
						</th>
						<td class="px-4 py-3 font-sans text-sm text-gray-500">
							{item.category}
						</td>
						<td class="px-4 py-3 text-right font-mono text-sm font-bold text-gray-900">
							{item.current_stock}
						</td>
						<td class="px-4 py-3 font-sans text-sm text-gray-500">
							{item.unit}
						</td>
						<td class="px-4 py-3 text-right font-mono text-sm text-gray-500">
							{item.low_stock_threshold}
						</td>
						<td class="px-4 py-3">
							{#if isLowStock(item)}
								<span
									class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 font-sans text-xs font-medium text-amber-800"
								>
									Sắp hết
								</span>
							{:else}
								<span
									class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-sans text-xs font-medium text-green-800"
								>
									Đủ hàng
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Mobile card layout (hidden on desktop) -->
<div class="space-y-4 md:hidden">
	{#each [...groupedItems] as [category, categoryItems] (category)}
		<div>
			<h2 class="mb-2 font-sans text-sm font-semibold text-gray-500 uppercase tracking-wide">
				{category}
			</h2>
			<div class="space-y-2">
				{#each categoryItems as item (item.id)}
					<div
						class="rounded-lg border p-4
							{isLowStock(item) ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200 bg-white'}"
					>
						<div class="flex items-start justify-between">
							<div>
								<p class="font-sans text-sm font-medium text-gray-900">{item.name}</p>
								<p class="mt-0.5 font-sans text-xs text-gray-500">
									{item.unit} · ngưỡng: {item.low_stock_threshold}
								</p>
							</div>
							<div class="text-right">
								<p class="font-mono text-2xl font-bold text-gray-900">
									{item.current_stock}
								</p>
								{#if isLowStock(item)}
									<span
										class="mt-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-sans text-xs font-medium text-amber-800"
									>
										Sắp hết
									</span>
								{:else}
									<span
										class="mt-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 font-sans text-xs font-medium text-green-800"
									>
										Đủ hàng
									</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
