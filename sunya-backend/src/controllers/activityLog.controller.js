import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import * as activityLogService from "../services/activityLog.service.js";

export const listActivityLogs = asyncHandler(async (req, res) => {
  const result = await activityLogService.getActivityLogs(req.query);
  return sendResponse(res, 200, "Activity logs fetched successfully", result);
});

export const getActivityLogById = asyncHandler(async (req, res) => {
  const log = await activityLogService.getActivityLogById(req.params.logId);
  return sendResponse(res, 200, "Activity log fetched successfully", { log });
});
