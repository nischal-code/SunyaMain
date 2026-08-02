import mongoose from "mongoose";
import { ATTENDANCE_STATUS } from "../utils/constants.js";

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      // Normalized to midnight (00:00:00) of the local business day.
      // Combined with `user` in a unique index to enforce one record/day.
      type: Date,
      required: true,
    },
    clockIn: {
      type: Date,
      default: null,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.ABSENT,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Enforce one attendance record per employee per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
