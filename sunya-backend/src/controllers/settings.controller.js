import { Settings } from "../models/Settings.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import { ACTIVITY_MODULE, ACTIVITY_ACTION } from "../utils/constants.js";
import { logActivity } from "../services/activityLog.service.js";

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  return sendResponse(res, 200, "Settings fetched successfully", { settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  const allowedFields = [
    "officeStartTime",
    "officeEndTime",
    "minWorkingHours",
    "gracePeriodMinutes",
    "halfDayThresholdHours",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  }

  await settings.save();

  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTION.SETTINGS_UPDATED,
    module: ACTIVITY_MODULE.SETTINGS,
    resourceId: settings._id,
    req,
  });

  return sendResponse(res, 200, "Settings updated successfully", { settings });
});
