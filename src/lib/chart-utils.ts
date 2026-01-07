const MONTH_ABBREVS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Returns the last N month abbreviations ending with the current month.
 * Example: If current month is March and count is 6, returns ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
 */
export function getMonthLabels(count: number): string[] {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11

  const labels: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    labels.push(MONTH_ABBREVS[monthIndex]);
  }

  return labels;
}

/**
 * Returns month labels for a specific date range.
 * Labels are positioned at the center of each month's span.
 */
export function getMonthLabelsForRange(
  startDate: Date,
  endDate: Date,
): string[] {
  const labels: string[] = [];
  const current = new Date(startDate);
  current.setDate(1); // Start from first of month

  while (current <= endDate) {
    labels.push(MONTH_ABBREVS[current.getMonth()]);
    current.setMonth(current.getMonth() + 1);
  }

  return labels;
}
