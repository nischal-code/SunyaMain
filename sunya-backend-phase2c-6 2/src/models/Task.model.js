import mongoose from "mongoose";
import { TASK_STATUS, TASK_PRIORITY } from "../utils/constants.js";

// Shared shape for both `attachments` (reference files added by admin/manager)
// and `deliverables` (work product uploaded by the assigned employee).
const fileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: null },
    name: { type: String, required: true },
    fileType: { type: String, default: null },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// Lightweight audit trail entry. Kept embedded (capped in the service layer)
// rather than a separate collection since it's always read scoped to a task.
const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    project: {
      // Free-text project/client label. Kept simple until a dedicated
      // Project entity is introduced.
      type: String,
      trim: true,
      default: null,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    attachments: [fileSchema],
    deliverables: [fileSchema],
    comments: [commentSchema],
    activityLog: [activityLogSchema],
    isDeleted: {
      // Soft delete: keeps activity/comment history intact for audit purposes.
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ title: "text", description: "text" });

// ------------------ Analytics / Dashboard support indexes ------------------
// Cover the (assignedTo, isDeleted, status, <range field>) shape used by the
// dashboard and productivity-analytics aggregation pipelines, so those
// pipelines' initial $match can use an index instead of a collection scan.
taskSchema.index({ assignedTo: 1, isDeleted: 1, status: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1, isDeleted: 1, status: 1, completedAt: -1 });
taskSchema.index({ assignedTo: 1, isDeleted: 1, project: 1 });
taskSchema.index({ assignedBy: 1, isDeleted: 1 });

export const Task = mongoose.model("Task", taskSchema);
