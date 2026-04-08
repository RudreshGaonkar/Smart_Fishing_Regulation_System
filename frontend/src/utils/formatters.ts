/**
 * Formats a given date string or Date object into a readable format.
 * Example: 'Oct 14, 2026'
 */
export const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

/**
 * Formats a percentage value for stock levels.
 * Example: 85.5 -> '85.5%'
 */
export const formatStockPercentage = (percentage: number | null | undefined): string => {
  if (percentage === null || percentage === undefined) return 'N/A';
  return `${Number(percentage).toFixed(1)}%`;
};

/**
 * Formats distance in kilometers.
 * Example: 12.45 -> '12.45 km'
 */
export const formatDistanceKm = (distance: number | null | undefined): string => {
  if (distance === null || distance === undefined) return 'N/A';
  return `${Number(distance).toFixed(2)} km`;
};
