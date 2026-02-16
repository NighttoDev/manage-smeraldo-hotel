import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { realtimeStatusStore, offlineQueueCountStore } from './realtimeStatus';

describe('realtimeStatusStore', () => {
	beforeEach(() => {
		realtimeStatusStore.set({ connected: false, lastUpdate: null });
	});

	it('has correct initial state', () => {
		const state = get(realtimeStatusStore);
		expect(state).toEqual({ connected: false, lastUpdate: null });
	});

	it('updates connected state', () => {
		realtimeStatusStore.set({ connected: true, lastUpdate: '2026-02-15T12:00:00Z' });
		const state = get(realtimeStatusStore);
		expect(state.connected).toBe(true);
		expect(state.lastUpdate).toBe('2026-02-15T12:00:00Z');
	});
});

describe('offlineQueueCountStore', () => {
	beforeEach(() => {
		offlineQueueCountStore.set(0);
	});

	it('has initial count of 0', () => {
		expect(get(offlineQueueCountStore)).toBe(0);
	});
});
