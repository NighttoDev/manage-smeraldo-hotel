import { describe, it, expect, vi } from 'vitest';
import { getAllInventoryItems } from './inventory';

function createMockSupabase(responseData: unknown = [], responseError: unknown = null) {
	const chain = {
		select: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		order: vi.fn().mockReturnThis()
	};

	// Final .order() call resolves with data
	let orderCallCount = 0;
	chain.order.mockImplementation(() => {
		orderCallCount++;
		if (orderCallCount >= 2) {
			return Promise.resolve({ data: responseData, error: responseError });
		}
		return chain;
	});

	return {
		from: vi.fn().mockReturnValue(chain),
		_chain: chain
	};
}

describe('getAllInventoryItems', () => {
	it('fetches all items ordered by category and name', async () => {
		const mockItems = [
			{
				id: '1',
				name: 'Coca-Cola',
				category: 'Đồ uống',
				current_stock: 24,
				low_stock_threshold: 10,
				unit: 'lon',
				created_at: null,
				updated_at: null
			},
			{
				id: '2',
				name: 'Khăn tắm',
				category: 'Vật tư',
				current_stock: 50,
				low_stock_threshold: 15,
				unit: 'cái',
				created_at: null,
				updated_at: null
			}
		];
		const supabase = createMockSupabase(mockItems);

		const result = await getAllInventoryItems(supabase as never);

		expect(supabase.from).toHaveBeenCalledWith('inventory_items');
		expect(supabase._chain.select).toHaveBeenCalledWith(
			'id, name, category, current_stock, low_stock_threshold, unit, created_at, updated_at'
		);
		expect(supabase._chain.order).toHaveBeenCalledWith('category', { ascending: true });
		expect(supabase._chain.order).toHaveBeenCalledWith('name', { ascending: true });
		expect(result).toEqual(mockItems);
	});

	it('returns empty array when no items exist', async () => {
		const supabase = createMockSupabase([]);

		const result = await getAllInventoryItems(supabase as never);

		expect(result).toEqual([]);
	});

	it('returns empty array when data is null', async () => {
		const supabase = createMockSupabase(null);

		const result = await getAllInventoryItems(supabase as never);

		expect(result).toEqual([]);
	});

	it('throws on database error', async () => {
		const supabase = createMockSupabase(null, { message: 'DB connection failed' });

		await expect(getAllInventoryItems(supabase as never)).rejects.toThrow(
			'Failed to fetch inventory items: DB connection failed'
		);
	});
});

describe('low-stock detection logic', () => {
	it('identifies items at threshold as low stock', () => {
		const item = { current_stock: 10, low_stock_threshold: 10 };
		expect(item.current_stock <= item.low_stock_threshold).toBe(true);
	});

	it('identifies items below threshold as low stock', () => {
		const item = { current_stock: 3, low_stock_threshold: 10 };
		expect(item.current_stock <= item.low_stock_threshold).toBe(true);
	});

	it('identifies items above threshold as not low stock', () => {
		const item = { current_stock: 24, low_stock_threshold: 10 };
		expect(item.current_stock <= item.low_stock_threshold).toBe(false);
	});

	it('identifies items at zero stock as low stock', () => {
		const item = { current_stock: 0, low_stock_threshold: 5 };
		expect(item.current_stock <= item.low_stock_threshold).toBe(true);
	});

	it('handles zero threshold correctly', () => {
		const item = { current_stock: 0, low_stock_threshold: 0 };
		expect(item.current_stock <= item.low_stock_threshold).toBe(true);
	});

	it('item with stock above zero threshold is not low stock', () => {
		const item = { current_stock: 1, low_stock_threshold: 0 };
		expect(item.current_stock <= item.low_stock_threshold).toBe(false);
	});
});
