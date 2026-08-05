import axiosClient from "./axiosClient";

/**
 * Attendance API
 * Maps to /api/v1/attendance/* (attendance.routes.js). All routes require
 * an authenticated request; the org-wide/manage routes are additionally
 * restricted to super_admin/admin/manager (enforced server-side), same
 * pattern as dashboard.api.js / user.api.js.
 */

/* ------------------------------------------------------------------ */
/* Self-service (clock in/out, own history)                            */
/* ------------------------------------------------------------------ */

// POST /attendance/clock-in
// No body needed — the backend stamps the current server time and
// derives the day's status (present/late) from office-timing settings.
export const clockIn = () => axiosClient.post("/attendance/clock-in");

// POST /attendance/clock-out
export const clockOut = () => axiosClient.post("/attendance/clock-out");

// GET /attendance/me/today
// Today's record for the authenticated user, or null if not clocked in yet.
export const getMyTodayAttendance = () => axiosClient.get("/attendance/me/today");

/**
 * Converts a { month (1-12), year } pair into the { startDate, endDate }
 * range the backend's attendanceHistoryQuerySchema actually accepts.
 * Any explicit startDate/endDate in `params` takes precedence.
 */
const monthYearToDateRange = ({ month, year, ...rest } = {}) => {
  if ((rest.startDate || rest.endDate) ?? false) return rest;
  if (!month && !year) return rest;

  const now = new Date();
  const resolvedYear = year ?? now.getFullYear();
  const resolvedMonth = (month ?? now.getMonth() + 1) - 1;
  const startDate = new Date(resolvedYear, resolvedMonth, 1).toISOString().slice(0, 10);
  const endDate = new Date(resolvedYear, resolvedMonth + 1, 0).toISOString().slice(0, 10);

  return { ...rest, startDate, endDate };
};

// GET /attendance/me
// params: { month, year, page, limit } (converted to startDate/endDate — see
// monthYearToDateRange) or pass startDate/endDate directly.
export const getMyAttendance = (params = {}) =>
  axiosClient.get("/attendance/me", { params: monthYearToDateRange(params) });

// GET /attendance/me/summary
// params: { month, year } — both optional, default to the current month.
// Returns: { month, year, daysRecorded, totalHours, counts: { <status>: count } }
export const getMyAttendanceSummary = (params = {}) =>
  axiosClient.get("/attendance/me/summary", { params });

/* ------------------------------------------------------------------ */
/* Admin / Manager attendance management                               */
/* ------------------------------------------------------------------ */

// GET /attendance
// Org-wide attendance list. Restricted to super_admin/admin/manager.
// params: { userId, department, status, startDate, endDate, search, page, limit }
export const listAttendance = (params = {}) => axiosClient.get("/attendance", { params });

// GET /attendance/user/:userId
// A specific user's attendance history. Restricted to super_admin/admin/manager.
// params: { month, year, page, limit } (converted to startDate/endDate) or
// pass startDate/endDate directly.
export const getUserAttendance = (userId, params = {}) =>
  axiosClient.get(`/attendance/user/${userId}`, { params: monthYearToDateRange(params) });

// POST /attendance/manual
// Creates a manual attendance entry for a user (e.g. backfilling a missed
// clock-in). Restricted to super_admin/admin/manager.
// body: { userId, date, status, checkIn, checkOut, remarks }
export const createManualAttendance = ({ userId, date, status, checkIn, checkOut, remarks }) =>
  axiosClient.post("/attendance/manual", { userId, date, status, checkIn, checkOut, remarks });

// PATCH /attendance/:attendanceId
// Edits an existing attendance record (manual correction). Restricted to
// super_admin/admin/manager.
// body: { status, checkIn, checkOut, remarks }
export const updateAttendance = (attendanceId, { status, checkIn, checkOut, remarks } = {}) =>
  axiosClient.patch(`/attendance/${attendanceId}`, { status, checkIn, checkOut, remarks });

// DELETE /attendance/:attendanceId
// Restricted to super_admin/admin.
export const deleteAttendance = (attendanceId) =>
  axiosClient.delete(`/attendance/${attendanceId}`);

/* ------------------------------------------------------------------ */
/* Reports                                                              */
/* ------------------------------------------------------------------ */

// GET /attendance/reports
// Aggregated org/department attendance report. Restricted to
// super_admin/admin/manager. params: { startDate, endDate, department, groupBy }
export const getAttendanceReport = (params = {}) =>
  axiosClient.get("/attendance/reports", { params });

// GET /attendance/reports/export
// Same filters as getAttendanceReport, streamed back as a CSV file.
export const exportAttendanceReport = (params = {}) =>
  axiosClient.get("/attendance/reports/export", { params, responseType: "blob" });

export default {
  clockIn,
  clockOut,
  getMyTodayAttendance,
  getMyAttendance,
  getMyAttendanceSummary,
  listAttendance,
  getUserAttendance,
  createManualAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceReport,
  exportAttendanceReport,
};