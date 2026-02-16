/** Total sellable rooms in Smeraldo Hotel — constant from seed data */
export const TOTAL_ROOMS = 23;

/** Calculate occupancy percentage, clamped to [0, 100] */
export function getOccupancyPercent(occupied: number, total: number): number {
	if (total <= 0) return 0;
	return Math.min(100, Math.max(0, (occupied / total) * 100));
}

/** Format occupancy label in Vietnamese */
export function getOccupancyLabel(occupied: number, total: number): string {
	return `${occupied} / ${total} phòng có khách`;
}
