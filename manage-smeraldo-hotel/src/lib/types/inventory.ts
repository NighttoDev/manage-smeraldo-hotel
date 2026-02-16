export interface InventoryItemRow {
	id: string;
	name: string;
	category: string;
	current_stock: number;
	low_stock_threshold: number;
	unit: string;
	created_at: string | null;
	updated_at: string | null;
}
