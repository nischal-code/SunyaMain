import mongoose from "mongoose";

/**
 * Singleton-style collection: only one document should exist,
 * fetched/created via Settings.getSettings().
 */
const settingsSchema = new mongoose.Schema(
  {
    officeStartTime: {
      // Stored as "HH:mm" 24-hour format, e.g. "09:30"
      type: String,
      default: "09:30",
    },
    officeEndTime: {
      type: String,
      default: "17:30",
    },
    minWorkingHours: {
      type: Number,
      default: 8,
    },
    gracePeriodMinutes: {
      type: Number,
      default: 15,
    },
    halfDayThresholdHours: {
      type: Number,
      default: 4,
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSettings = async function getSettings() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export const Settings = mongoose.model("Settings", settingsSchema);
