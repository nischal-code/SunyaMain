import cron from "node-cron";
import { User } from "../models/User.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { getStartOfDay } from "../services/attendance.service.js";
import { ATTENDANCE_STATUS } from "../utils/constants.js";
import { logger } from "../utils/logger.js";

/**
 * Runs every day at 23:55 and creates an "absent" attendance record
 * for any active employee who never clocked in that day.
 */
export const scheduleAbsentMarkerJob = () => {
  cron.schedule("55 23 * * *", async () => {
    try {
      const today = getStartOfDay();

      const [allUsers, existingRecords] = await Promise.all([
        User.find({ isActive: true }).select("_id"),
        Attendance.find({ date: today }).select("user"),
      ]);

      const attendedUserIds = new Set(existingRecords.map((r) => r.user.toString()));
      const absentees = allUsers.filter((u) => !attendedUserIds.has(u._id.toString()));

      if (absentees.length === 0) return;

      const docs = absentees.map((u) => ({
        user: u._id,
        date: today,
        status: ATTENDANCE_STATUS.ABSENT,
      }));

      await Attendance.insertMany(docs, { ordered: false });
      logger.info(`Absent marker job: marked ${docs.length} employee(s) as absent`);
    } catch (error) {
      logger.error(`Absent marker job failed: ${error.message}`);
    }
  });
};
