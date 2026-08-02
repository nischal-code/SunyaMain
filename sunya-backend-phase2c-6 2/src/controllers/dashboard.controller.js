import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import * as attendanceService from "../services/attendance.service.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await attendanceService.getDashboardStats();

  return sendResponse(res, 200, "Dashboard stats fetched successfully", stats);
});

// Employee's own dashboard: attendance, tasks, projects, activity, notifications.
export const getEmployeeDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getEmployeeDashboard(req.user);

  return sendResponse(res, 200, "Employee dashboard fetched successfully", data);
});

// ------------------ Paginated Employee Dashboard cards ------------------
// Each of these is scoped to the authenticated user only (req.user._id).

export const getTodaysTasks = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await dashboardService.getTodaysTasks(req.user._id, { page, limit, sortBy, sortOrder, search });

  return sendResponse(res, 200, "Today's tasks fetched successfully", result);
});

export const getUpcomingDeadlines = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await dashboardService.getUpcomingDeadlines(req.user._id, { page, limit, sortBy, sortOrder, search });

  return sendResponse(res, 200, "Upcoming deadlines fetched successfully", result);
});

export const getAssignedProjects = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await dashboardService.getAssignedProjects(req.user._id, { page, limit, sortBy, sortOrder, search });

  return sendResponse(res, 200, "Assigned projects fetched successfully", result);
});

export const getRunningProjects = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await dashboardService.getRunningProjects(req.user._id, { page, limit, sortBy, sortOrder, search });

  return sendResponse(res, 200, "Running projects fetched successfully", result);
});

// Dashboard Summary: Completed Tasks, Pending Reviews, Attendance Summary
// (Present/Absent/Late/Total Working Days) for the authenticated user.
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const result = await dashboardService.getDashboardSummary(req.user._id, { month, year });

  return sendResponse(res, 200, "Dashboard summary fetched successfully", result);
});
