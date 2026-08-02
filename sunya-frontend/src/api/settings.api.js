import axiosClient from "./axiosClient";

/**
 * Settings API
 * Maps to /api/v1/settings/* (settings.routes.js). Backs the single
 * org-wide office-timing/attendance-rules document (Settings.model.js —
 * a singleton fetched/created via Settings.getSettings()).
 *
 * - GET /settings   restricted to super_admin/admin/manager
 * - PATCH /settings restricted to super_admin/admin
 */

// GET /settings
export const getSettings = () => axiosClient.get("/settings");

// PATCH /settings
// Only send the fields being changed — the backend patches whatever
// keys are present in the body and leaves the rest untouched.
// body: { officeStartTime, officeEndTime, minWorkingHours, gracePeriodMinutes, halfDayThresholdHours }
export const updateSettings = ({
  officeStartTime,
  officeEndTime,
  minWorkingHours,
  gracePeriodMinutes,
  halfDayThresholdHours,
} = {}) =>
  axiosClient.patch("/settings", {
    officeStartTime,
    officeEndTime,
    minWorkingHours,
    gracePeriodMinutes,
    halfDayThresholdHours,
  });

export default {
  getSettings,
  updateSettings,
};
