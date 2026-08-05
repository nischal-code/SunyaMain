/**
 * formatTime.js
 * Time-of-day and duration formatting helpers, mainly for attendance
 * (checkIn/checkOut timestamps) and productivity (tracked seconds/minutes).
 */

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "9:30 AM" */
export const formatTime = (value) => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

/** Formats a duration given in seconds as "2h 15m" (or "45m", "30s"). */
export const formatDuration = (totalSeconds = 0) => {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
};

/** Formats a duration given in minutes as "2h 15m". */
export const formatMinutes = (totalMinutes = 0) => formatDuration(totalMinutes * 60);

/** Formats a clock-in/clock-out pair as "9:30 AM – 6:05 PM" (or "9:30 AM – …" if still open). */
export const formatTimeRange = (checkIn, checkOut) => {
  if (!checkIn) return "—";
  const start = formatTime(checkIn);
  const end = checkOut ? formatTime(checkOut) : "…";
  return `${start} – ${end}`;
};

export default { formatTime, formatDuration, formatMinutes, formatTimeRange };
