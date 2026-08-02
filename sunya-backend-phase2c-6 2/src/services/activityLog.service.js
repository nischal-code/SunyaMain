import { ActivityLog } from "../models/ActivityLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

/**
 * Reusable helper to record an activity log entry. Designed to be imported
 * and called from any controller/service later (e.g. after a task update,
 * a login, a role change) without needing to duplicate ip/userAgent
 * extraction logic everywhere.
 *
 * Pass `req` to auto-derive ipAddress/userAgent, or pass them explicitly.
 * This never throws — a logging failure should not break the calling
 * request flow, so errors are swallowed and warned to the logger.
 *
 * @param {Object} params
 * @param {string|import("mongoose").Types.ObjectId} params.user - Acting user's ID
 * @param {string} params.action - e.g. "LOGIN", "TASK_CREATED", "USER_ROLE_UPDATED"
 * @param {string} params.module - e.g. "auth", "task", "project", "user"
 * @param {string|null} [params.resourceId] - ID of the affected resource, if any
 * @param {import("express").Request} [params.req] - Express request to derive ip/userAgent from
 * @param {string|null} [params.ipAddress] - Explicit override for ipAddress
 * @param {string|null} [params.userAgent] - Explicit override for userAgent
 * @returns {Promise<import("../models/ActivityLog.model.js").ActivityLog|null>}
 */
export const logActivity = async ({
  user,
  action,
  module,
  resourceId = null,
  req = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    const resolvedIp =
      ipAddress || req?.ip || req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || null;
    const resolvedUserAgent = userAgent || req?.headers?.["user-agent"] || null;

    return await ActivityLog.create({
      user,
      action,
      module,
      resourceId: resourceId ? String(resourceId) : null,
      ipAddress: resolvedIp,
      userAgent: resolvedUserAgent,
    });
  } catch (error) {
    logger.warn(`Failed to log activity [${module}:${action}]: ${error.message}`);
    return null;
  }
};

/**
 * Paginated + filterable + searchable list of activity logs (admin use).
 *
 * `search` performs a case-insensitive match across action/module/resourceId.
 * Sorting defaults to newest-first by `timestamp`; `sortBy` is restricted to
 * indexed/whitelisted fields by the validator, so it's safe to interpolate
 * directly into the sort object here.
 */
export const getActivityLogs = async ({
  page = 1,
  limit = 20,
  user,
  module,
  action,
  resourceId,
  search,
  from,
  to,
  sortBy = "timestamp",
  sortOrder = "desc",
} = {}) => {
  const filter = {};

  if (user) filter.user = user;
  if (module) filter.module = module;
  if (action) filter.action = action;
  if (resourceId) filter.resourceId = resourceId;

  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  if (search) {
    const regex = { $regex: search, $options: "i" };
    filter.$or = [{ action: regex }, { module: regex }, { resourceId: regex }];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("user", "name email role")
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getActivityLogById = async (logId) => {
  const log = await ActivityLog.findById(logId).populate("user", "name email role").lean();

  if (!log) throw new ApiError(404, "Activity log not found");
  return log;
};
