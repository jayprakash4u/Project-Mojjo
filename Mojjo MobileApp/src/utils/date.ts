/**
 * Format ISO date string into human readable format: "12 Oct, 04:30 PM"
 */
export const formatDateTime = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoDate;
  }
};

/**
 * Format date for delivery ETA (e.g. "Today within 10 mins" or "8-12 mins")
 */
export const formatEstimatedDeliveryTime = (minutes: number = 10): string => {
  const min = Math.max(5, minutes - 2);
  const max = minutes + 2;
  return `${min}-${max} mins`;
};
