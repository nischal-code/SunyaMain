import axiosClient from "./axiosClient";

/**
 * Productivity API
 * Maps to /api/v1/productivity/* (productivity.routes.js). Every route
 * requires an authenticated request. Mirrors the org/employee split used
 * by dashboard.api.js: the org-wide + leaderboard + single-employee-lookup
 * endpoints are restricted server-side to super_admin/admin/manager, while
 * the "/employee" endpoints (no :userId) always resolve to the requester's
 * own data.
 *
 * period: "week" | "month" | "quarter" — every summary/leaderboard/trend
 * endpoint accepts this and defaults to "month" server-side when omitted.
 */

/* ------------------------------------------------------------------ */
/* Org-wide (privileged)                                               */
/* ------------------------------------------------------------------ */

// GET /productivity
// Org-wide productivity snapshot: averageScore, totalEmployees,
// topPerformer, byDepartment[]. Restricted to super_admin/admin/manager.
// params: { period, department }
export const getOrgProductivity = (params = {}) =>
  axiosClient.get("/productivity", { params });

// GET /productivity/leaderboard
// Ranked list of employees by productivity score.
// params: { period, department, page, limit, sortOrder }
// Restricted to super_admin/admin/manager.
export const getLeaderboard = (params = {}) =>
  axiosClient.get("/productivity/leaderboard", { params });

/* ------------------------------------------------------------------ */
/* Employee self-service                                               */
/* ------------------------------------------------------------------ */

// GET /productivity/employee
// The authenticated user's own productivity summary for the given period:
// score, tasksCompleted, tasksOnTime, onTimeRate, attendanceRate,
// avgCompletionHours, previousScore, rank (within their department).
// params: { period, month, year }
export const getMyProductivity = (params = {}) =>
  axiosClient.get("/productivity/employee", { params });

// GET /productivity/employee/trend
// The authenticated user's score history as a series of points, e.g.
// { points: [{ label: "Jan", score: 72 }, ...] }.
// params: { period: "weekly" | "monthly", range } — range = number of points
export const getMyProductivityTrend = (params = {}) =>
  axiosClient.get("/productivity/employee/trend", { params });

/* ------------------------------------------------------------------ */
/* Admin / Manager — single employee lookup                            */
/* ------------------------------------------------------------------ */

// GET /productivity/employee/:userId
// Same shape as getMyProductivity but for any employee.
// Restricted to super_admin/admin/manager.
// params: { period, month, year }
export const getUserProductivity = (userId, params = {}) =>
  axiosClient.get(`/productivity/employee/${userId}`, { params });

// GET /productivity/employee/:userId/trend
// Same shape as getMyProductivityTrend but for any employee.
// Restricted to super_admin/admin/manager.
// params: { period, range }
export const getUserProductivityTrend = (userId, params = {}) =>
  axiosClient.get(`/productivity/employee/${userId}/trend`, { params });

export default {
  getOrgProductivity,
  getLeaderboard,
  getMyProductivity,
  getMyProductivityTrend,
  getUserProductivity,
  getUserProductivityTrend,
};
