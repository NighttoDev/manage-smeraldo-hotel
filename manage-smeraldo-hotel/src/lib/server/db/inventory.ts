// Server-only — never import from .svelte components
import type { SupabaseClient } from '@supabase/supabase-js';
import type { InventoryItemRow } from '$lib/types/inventory';

export type { InventoryItemRow };

/**
 * Fetch all inventory items ordered by category ASC, name ASC.
 */
export async function getAllInventoryItems(
	supabase: SupabaseClient
): Promise<InventoryItemRow[]> {
	const { data, error } = await supabase
		.from('inventory_items')
		.select('id, name, category, current_stock, low_stock_threshold, unit, created_at, updated_at')
		.order('category', { ascending: true })
		.order('name', { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch inventory items: ${error.message}`);
	}

	return (data ?? []) as InventoryItemRow[];
}
