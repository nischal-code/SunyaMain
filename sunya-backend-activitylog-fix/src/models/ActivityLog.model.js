import mongoose from "mongoose";

/**
 * Immutable audit trail of user actions across the system.
 * Records are created via services/activityLog.service.js#logActivity and
 * are never updated in place, so no `timestamps` option is used here —
 * `timestamp` is the single source of truth for when the action occurred.
 */
const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  module: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  resourceId: {
    type: String,
    default: null,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ module: 1, timestamp: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
