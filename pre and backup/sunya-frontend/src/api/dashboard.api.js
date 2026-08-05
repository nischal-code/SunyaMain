import axiosClient from "./axiosClient";

/**
 * Dashboard API
 * Maps to /api/v1/dashboard/* (dashboard.routes.js). Every route requires
 * an authenticated request; the org-wide overview additionally requires
 * super_admin/admin/manager (enforced server-side).
 */

// GET /dashboard
// Org-wide snapshot: totalEmployees, presentEmployees, absentEmployees,
// onLeave, todayAttendance. Restricted to super_admin/admin/manager.
export const getOrgOverview = () => axiosClient.get("/dashboard");

// GET /dashboard/employee
// Everything the authenticated user's own dashboard needs in one call:
// welcome, attendanceSummary, taskSummary, todaysTasks, upcomingDeadlines,
// pendingTasks, completedTasks, assignedProjects, recentActivity, notifications.
export const getEmployeeOverview = () => axiosClient.get("/dashboard/employee");

// GET /dashboard/employee/today-tasks
// Paginated. params: { page, limit, sortBy: "deadline"|"newest", sortOrder, search }
export const getTodaysTasks = (params = {}) =>
  axiosClient.get("/dashboard/employee/today-tasks", { params });

// GET /dashboard/employee/upcoming-deadlines
// Paginated. params: { page, limit, sortBy: "deadline"|"newest", sortOrder, search }
export const getUpcomingDeadlines = (params = {}) =>
  axiosClient.get("/dashboard/employee/upcoming-deadlines", { params });

// GET /dashboard/employee/assigned-projects
// Paginated. params: { page, limit, sortBy: "deadline"|"newest", sortOrder, search }
export const getAssignedProjects = (params = {}) =>
  axiosClient.get("/dashboard/employee/assigned-projects", { params });

// GET /dashboard/employee/running-projects
// Paginated. params: { page, limit, sortBy: "deadline"|"newest", sortOrder, search }
export const getRunningProjects = (params = {}) =>
  axiosClient.get("/dashboard/employee/running-projects", { params });

// GET /dashboard/employee/summary
// Completed tasks, pending reviews, attendance summary for a calendar month.
// params: { month, year } — both optional, default to the current month.
export const getDashboardSummary = (params = {}) =>
  axiosClient.get("/dashboard/employee/summary", { params });

export default {
  getOrgOverview,
  getEmployeeOverview,
  getTodaysTasks,
  getUpcomingDeadlines,
  getAssignedProjects,
  getRunningProjects,
  getDashboardSummary,
};
