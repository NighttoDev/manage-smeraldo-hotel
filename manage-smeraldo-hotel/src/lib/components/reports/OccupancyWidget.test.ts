import { describe, it, expect } from 'vitest';
import { getOccupancyPercent, getOccupancyLabel } from './occupancyUtils';

const TOTAL_ROOMS = 23;

describe('getOccupancyPercent', () => {
	it('calculates 0% when no rooms occupied', () => {
		expect(getOccupancyPercent(0, TOTAL_ROOMS)).toBe(0);
	});

	it('calculates 100% when all rooms occupied', () => {
		expect(getOccupancyPercent(23, TOTAL_ROOMS)).toBe(100);
	});

	it('calculates correct percentage for partial occupancy', () => {
		// 15 / 23 ≈ 65.22%
		expect(getOccupancyPercent(15, TOTAL_ROOMS)).toBeCloseTo(65.22, 1);
	});

	it('clamps to 0 when occupied is negative', () => {
		expect(getOccupancyPercent(-1, TOTAL_ROOMS)).toBe(0);
	});

	it('clamps to 100 when occupied exceeds total', () => {
		expect(getOccupancyPercent(25, TOTAL_ROOMS)).toBe(100);
	});

	it('returns 0 when total is 0 (prevents division by zero)', () => {
		expect(getOccupancyPercent(0, 0)).toBe(0);
	});
});

describe('getOccupancyLabel', () => {
	it('formats count with total', () => {
		expect(getOccupancyLabel(15, TOTAL_ROOMS)).toBe('15 / 23 phòng có khách');
	});

	it('handles zero occupancy', () => {
		expect(getOccupancyLabel(0, TOTAL_ROOMS)).toBe('0 / 23 phòng có khách');
	});

	it('handles full occupancy', () => {
		expect(getOccupancyLabel(23, TOTAL_ROOMS)).toBe('23 / 23 phòng có khách');
	});
});
