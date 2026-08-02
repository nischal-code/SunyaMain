import axiosClient from "./axiosClient";

/**
 * Activity Log API
 * Maps to /api/v1/activity-logs/* (activityLog.routes.js). Every route is
 * restricted server-side to super_admin/admin — this is an audit trail of
 * user actions across the system (auth, task, project, user, etc.), not a
 * user-facing feature.
 */

/* ------------------------------------------------------------------ */
/* Listing / detail                                                     */
/* ------------------------------------------------------------------ */

// GET /activity-logs
// Restricted to super_admin/admin.
// params: { page, limit, user, module, action, resourceId, search, from, to, sortBy, sortOrder }
// - user:       ObjectId — filter by the acting user
// - module:     string — e.g. "auth", "task", "project", "user"
// - action:     string — e.g. "LOGIN", "TASK_CREATED", "USER_ROLE_UPDATED"
// - resourceId: string — the affected resource's id
// - search:     string — case-insensitive match across action/module/resourceId
// - from / to:  date — filters by `timestamp`
// - sortBy:     "timestamp" | "module" | "action" | "user" (default "timestamp")
// - sortOrder:  "asc" | "desc" (default "desc")
// Response data: { logs, pagination: { total, page, limit, totalPages } }
export const listActivityLogs = ({
  page,
  limit,
  user,
  module,
  action,
  resourceId,
  search,
  from,
  to,
  sortBy,
  sortOrder,
} = {}) =>
  axiosClient.get("/activity-logs", {
    params: {
      page,
      limit,
      user,
      module,
      action,
      resourceId,
      search,
      from,
      to,
      sortBy,
      sortOrder,
    },
  });

// GET /activity-logs/:logId
// Restricted to super_admin/admin. Response data: { log }
export const getActivityLogById = (logId) => axiosClient.get(`/activity-logs/${logId}`);

export default {
  listActivityLogs,
  getActivityLogById,
};