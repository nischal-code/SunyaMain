import mongoose from "mongoose";
import { PROJECT_STATUS, MILESTONE_STATUS } from "../utils/constants.js";

// Shared shape for both `files` (reference/project files added by admin/PM)
// and `deliverables` (work product uploaded for the client).
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

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Milestone title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: Object.values(MILESTONE_STATUS),
      default: MILESTONE_STATUS.PENDING,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Lightweight audit trail entry. Kept embedded (capped in the service layer)
// rather than a separate collection since it's always read scoped to a project.
const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Client is kept as an embedded subdocument (not a User) since clients don't
// log into the system in this phase — just a contact record on the project.
const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Client name is required"], trim: true, maxlength: 150 },
    company: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    client: {
      type: clientSchema,
      required: true,
    },
    budget: {
      amount: { type: Number, min: 0, default: null },
      currency: { type: String, trim: true, default: "USD" },
    },
    deadline: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNING,
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    milestones: [milestoneSchema],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    files: [fileSchema],
    deliverables: [fileSchema],
    activityLog: [activityLogSchema],
    isDeleted: {
      // Soft delete: keeps activity/milestone history intact for audit purposes.
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

projectSchema.index({ projectManager: 1, status: 1 });
projectSchema.index({ team: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ name: "text", description: "text", "client.name": "text", "client.company": "text" });

// ------------------ Analytics / Dashboard support indexes ------------------
// Dashboard cards and productivity participation stats always filter on
// isDeleted alongside projectManager/team; index that shape directly.
projectSchema.index({ isDeleted: 1, projectManager: 1, status: 1 });
projectSchema.index({ isDeleted: 1, team: 1, status: 1 });

export const Project = mongoose.model("Project", projectSchema);
