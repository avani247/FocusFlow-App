// Utility functions for working with dates and determining streaks.

/**
 * Return ISO date string (YYYY-MM-DD) for a given Date object. Uses local time.
 * @param {Date} date
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Check if two dates (as Date objects) fall on the same calendar day in local time.
 * @param {Date} a
 * @param {Date} b
 */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Generate an array of date objects representing the last N days including today.
 * Most recent date is at the end of the array. Useful for charts.
 * @param {number} n
 */
export function getLastNDates(n) {
  const dates = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d);
  }
  return dates;
}

/**
 * Get the day name (Mon, Tue, …) for a Date object.
 * @param {Date} date
 */
export function getDayName(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}