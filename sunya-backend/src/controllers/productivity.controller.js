import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../utils/constants.js";
import * as productivityService from "../services/productivity.service.js";

const ADMIN_TIER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

/**
 * Resolves which user's analytics to return. Employees are always scoped
 * to their own data; admin-tier roles may pass `?userId=` to view any
 * employee's analytics.
 */
const resolveTargetUserId = (req) => {
  const { userId } = req.query;

  if (!userId || String(userId) === String(req.user._id)) {
    return req.user._id;
  }

  if (!ADMIN_TIER_ROLES.includes(req.user.role)) {
    throw new ApiError(403, "You do not have permission to view another employee's analytics");
  }

  return userId;
};

export const getTasksCompleted = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);
  const { from, to } = req.query;

  const result = await productivityService.getTasksCompleted(userId, { from, to });
  return sendResponse(res, 200, "Tasks completed analytics fetched successfully", result);
});

export const getTasksPending = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);

  const result = await productivityService.getTasksPending(userId);
  return sendResponse(res, 200, "Tasks pending analytics fetched successfully", result);
});

export const getAverageCompletionTime = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);
  const { from, to } = req.query;

  const result = await productivityService.getAverageCompletionTime(userId, { from, to });
  return sendResponse(res, 200, "Average completion time analytics fetched successfully", result);
});

export const getProjectParticipation = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);

  const result = await productivityService.getProjectParticipation(userId);
  return sendResponse(res, 200, "Project participation analytics fetched successfully", result);
});

export const getAttendanceRate = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);
  const { from, to } = req.query;

  const result = await productivityService.getAttendanceRate(userId, { from, to });
  return sendResponse(res, 200, "Attendance rate analytics fetched successfully", result);
});

export const getDailyProductivity = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);
  const { date } = req.query;

  const result = await productivityService.getDailyProductivity(userId, { date });
  return sendResponse(res, 200, "Daily productivity analytics fetched successfully", result);
});

export const getWeeklyProductivity = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);
  const { weekStart } = req.query;

  const result = await productivityService.getWeeklyProductivity(userId, { weekStart });
  return sendResponse(res, 200, "Weekly productivity analytics fetched successfully", result);
});

export const getMonthlyProductivity = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);
  const { month, year } = req.query;

  const result = await productivityService.getMonthlyProductivity(userId, { month, year });
  return sendResponse(res, 200, "Monthly productivity analytics fetched successfully", result);
});

// ------------------ Org-wide (privileged) ------------------

export const getOrgProductivity = asyncHandler(async (req, res) => {
  const { period, department } = req.query;
  const result = await productivityService.getOrgProductivity({ period, department });
  return sendResponse(res, 200, "Org productivity snapshot fetched successfully", result);
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const { period, department, page, limit, sortOrder } = req.query;
  const result = await productivityService.getLeaderboard({ period, department, page, limit, sortOrder });
  return sendResponse(res, 200, "Productivity leaderboard fetched successfully", result);
});

// ------------------ Employee summary / trend (self-service + admin lookup) ------------------

export const getMyProductivity = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);
  const { period, month, year } = req.query;

  const result = await productivityService.getEmployeeSummary(userId, { period, month, year });
  return sendResponse(res, 200, "Productivity summary fetched successfully", result);
});

export const getMyProductivityTrend = asyncHandler(async (req, res) => {
  const userId = resolveTargetUserId(req);
  const { period, range } = req.query;

  const result = await productivityService.getEmployeeTrend(userId, { period, range });
  return sendResponse(res, 200, "Productivity trend fetched successfully", result);
});

export const getUserProductivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { period, month, year } = req.query;

  const result = await productivityService.getEmployeeSummary(userId, { period, month, year });
  return sendResponse(res, 200, "Employee productivity summary fetched successfully", result);
});

export const getUserProductivityTrend = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { period, range } = req.query;

  const result = await productivityService.getEmployeeTrend(userId, { period, range });
  return sendResponse(res, 200, "Employee productivity trend fetched successfully", result);
});