/**
 * formatDate.js
 * Date formatting helpers for values coming back from the Sunya API
 * (ISO 8601 strings/Date-parsable values from Mongo timestamps).
 */

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "Jan 5, 2026" */
export const formatDate = (value, options = {}) => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

/** "Jan 5, 2026, 9:30 AM" */
export const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/** Relative phrasing: "2 hours ago", "in 3 days", "just now" */
export const formatRelativeTime = (value) => {
  const date = toDate(value);
  if (!date) return "—";

  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const UNITS = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  if (absSeconds < 45) return "just now";

  for (const [unit, secondsInUnit] of UNITS) {
    if (absSeconds >= secondsInUnit) {
      const value_ = Math.round(diffSeconds / secondsInUnit);
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(value_, unit);
    }
  }

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  return rtf.format(Math.round(diffSeconds / 60), "minute");
};

/** "2026-01-05" — for <input type="date"> values */
export const toInputDateValue = (value) => {
  const date = toDate(value);
  if (!date) return "";
  return date.toISOString().slice(0, 10);
};

/** Whether the given date falls on today's calendar date (local time). */
export const isToday = (value) => {
  const date = toDate(value);
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  toInputDateValue,
  isToday,
};
