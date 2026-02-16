/**
 * Format a YYYY-MM-DD date string for display using Vietnamese locale.
 * Uses T12:00:00 to avoid timezone-boundary issues on date-only strings.
 */
export function formatDateVN(dateStr: string): string {
	return new Intl.DateTimeFormat('vi-VN').format(new Date(dateStr + 'T12:00:00'));
}
