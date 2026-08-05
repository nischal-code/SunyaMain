import mongoose from "mongoose";
import { Attendance } from "../models/Attendance.model.js";
import { Settings } from "../models/Settings.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ATTENDANCE_STATUS, MIN_CLOCK_OUT_HOURS } from "../utils/constants.js";

/**
 * Returns a Date object set to midnight (00:00:00.000) for the given date,
 * used as the canonical `date` field for one-record-per-day enforcement.
 */
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Combines today's date with an "HH:mm" time string into a Date object.
 */
const combineDateAndTime = (baseDate, timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const combined = new Date(baseDate);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

/**
 * Determines attendance status based on clock-in/out times and admin settings.
 */
export const determineStatus = ({ clockIn, clockOut, settings, isRemote }) => {
  if (isRemote) return ATTENDANCE_STATUS.REMOTE;

  const dayStart = getStartOfDay(clockIn);
  const officeStart = combineDateAndTime(dayStart, settings.officeStartTime);
  const graceDeadline = new Date(officeStart.getTime() + settings.gracePeriodMinutes * 60000);

  const isLate = clockIn > graceDeadline;

  if (!clockOut) {
    return isLate ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT;
  }

  const workedHours = (clockOut - clockIn) / (1000 * 60 * 60);

  if (workedHours < settings.halfDayThresholdHours) {
    return ATTENDANCE_STATUS.HALF_DAY;
  }

  if (workedHours < settings.minWorkingHours || isLate) {
    return isLate ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.HALF_DAY;
  }

  return ATTENDANCE_STATUS.PRESENT;
};

export const clockIn = async (userId, { isRemote = false } = {}) => {
  const today = getStartOfDay();

  const existing = await Attendance.findOne({ user: userId, date: today });
  if (existing && existing.clockIn) {
    throw new ApiError(400, "You have already clocked in today");
  }

  const settings = await Settings.getSettings();
  const now = new Date();

  const status = determineStatus({ clockIn: now, clockOut: null, settings, isRemote });

  if (existing) {
    existing.clockIn = now;
    existing.isRemote = isRemote;
    existing.status = status;
    await existing.save();
    return existing;
  }

  const record = await Attendance.create({
    user: userId,
    date: today,
    clockIn: now,
    isRemote,
    status,
  });

  return record;
};

export const clockOut = async (userId) => {
  const today = getStartOfDay();

  const record = await Attendance.findOne({ user: userId, date: today });

  if (!record || !record.clockIn) {
    throw new ApiError(400, "You have not clocked in today");
  }

  if (record.clockOut) {
    throw new ApiError(400, "You have already clocked out today");
  }

  const now = new Date();
  const hoursSinceClockIn = (now - record.clockIn) / (1000 * 60 * 60);

  if (hoursSinceClockIn < MIN_CLOCK_OUT_HOURS) {
    const remainingMinutes = Math.ceil((MIN_CLOCK_OUT_HOURS - hoursSinceClockIn) * 60);
    throw new ApiError(
      400,
      `You cannot clock out yet. Please wait ${remainingMinutes} more minute(s) (minimum ${MIN_CLOCK_OUT_HOURS} hours after clock-in).`
    );
  }

  const settings = await Settings.getSettings();

  record.clockOut = now;
  record.totalHours = Number(hoursSinceClockIn.toFixed(2));
  record.status = determineStatus({
    clockIn: record.clockIn,
    clockOut: now,
    settings,
    isRemote: record.isRemote,
  });

  await record.save();
  return record;
};

export const getAttendanceHistory = async (userId, { startDate, endDate, page = 1, limit = 30 } = {}) => {
  const filter = { user: userId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = getStartOfDay(new Date(startDate));
    if (endDate) filter.date.$lte = getStartOfDay(new Date(endDate));
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Aggregates an employee's attendance for the calendar month containing
 * `referenceDate` (defaults to now). Used by the employee dashboard.
 */
export const getMonthlySummary = async (userId, referenceDate = new Date()) => {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59, 999);

  // Aggregated server-side (single indexed pass on {user,date}) instead of
  // fetching every record and reducing in JS.
  const [byStatus] = await Attendance.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    {
      $facet: {
        counts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        totals: [
          { $group: { _id: null, daysRecorded: { $sum: 1 }, totalHours: { $sum: "$totalHours" } } },
        ],
      },
    },
  ]);

  const counts = (byStatus?.counts || []).reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  const totals = byStatus?.totals[0] || { daysRecorded: 0, totalHours: 0 };
  const totalWorkingHours = Number((totals.totalHours || 0).toFixed(2));
  const averageWorkingHours = totals.daysRecorded
    ? Number((totalWorkingHours / totals.daysRecorded).toFixed(2))
    : 0;

  return {
    month: start.getMonth() + 1,
    year: start.getFullYear(),
    daysRecorded: totals.daysRecorded,
    totalHours: totalWorkingHours,
    counts,
    // Flat fields consumed by AttendanceSummaryCard on the frontend.
    presentDays: counts[ATTENDANCE_STATUS.PRESENT] || 0,
    lateDays: counts[ATTENDANCE_STATUS.LATE] || 0,
    absentDays: counts[ATTENDANCE_STATUS.ABSENT] || 0,
    onLeaveDays: counts[ATTENDANCE_STATUS.LEAVE] || 0,
    totalWorkingHours,
    averageWorkingHours,
  };
};

/**
 * Wraps getMonthlySummary to accept an explicit { month, year } pair (as
 * sent by the frontend) instead of a single referenceDate.
 */
export const getMySummary = async (userId, { month, year } = {}) => {
  const now = new Date();
  const referenceDate =
    month || year
      ? new Date(year ?? now.getFullYear(), (month ?? now.getMonth() + 1) - 1, 1)
      : now;

  return getMonthlySummary(userId, referenceDate);
};

/**
 * Creates or overwrites a single day's attendance record for a user.
 * Used by admins/managers to backfill a missed clock-in or correct a
 * record after the fact. Upserts on the (user, date) unique index.
 */
export const createManualAttendance = async ({ userId, date, status, checkIn, checkOut, remarks }) => {
  if (!userId || !date || !status) {
    throw new ApiError(400, "userId, date, and status are required");
  }

  const day = getStartOfDay(new Date(date));

  const totalHours =
    checkIn && checkOut ? Number(((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60)).toFixed(2)) : 0;

  const record = await Attendance.findOneAndUpdate(
    { user: userId, date: day },
    {
      user: userId,
      date: day,
      status,
      clockIn: checkIn ? new Date(checkIn) : null,
      clockOut: checkOut ? new Date(checkOut) : null,
      totalHours,
      notes: remarks ?? null,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return record;
};

/**
 * Edits an existing attendance record (partial update — only the fields
 * provided are changed).
 */
export const updateAttendanceRecord = async (attendanceId, { status, checkIn, checkOut, remarks } = {}) => {
  const record = await Attendance.findById(attendanceId);
  if (!record) throw new ApiError(404, "Attendance record not found");

  if (status !== undefined) record.status = status;
  if (checkIn !== undefined) record.clockIn = checkIn ? new Date(checkIn) : null;
  if (checkOut !== undefined) record.clockOut = checkOut ? new Date(checkOut) : null;
  if (remarks !== undefined) record.notes = remarks;

  if (record.clockIn && record.clockOut) {
    record.totalHours = Number(((record.clockOut - record.clockIn) / (1000 * 60 * 60)).toFixed(2));
  }

  await record.save();
  return record;
};

export const deleteAttendanceRecord = async (attendanceId) => {
  const record = await Attendance.findByIdAndDelete(attendanceId);
  if (!record) throw new ApiError(404, "Attendance record not found");
};

/**
 * Aggregated attendance report across a date range, optionally scoped to
 * a department and grouped by "status" (default), "department", or "day".
 */
export const getAttendanceReport = async ({ startDate, endDate, department, groupBy = "status" } = {}) => {
  const match = {};
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = getStartOfDay(new Date(startDate));
    if (endDate) match.date.$lte = getStartOfDay(new Date(endDate));
  }

  const pipeline = [{ $match: match }];

  const needsUserJoin = Boolean(department) || groupBy === "department";
  if (needsUserJoin) {
    pipeline.push(
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDoc" } },
      { $unwind: "$userDoc" }
    );
    if (department) {
      pipeline.push({ $match: { "userDoc.department": department } });
    }
  }

  const groupIdByDimension = {
    status: "$status",
    department: "$userDoc.department",
    day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
  };

  pipeline.push({
    $group: {
      _id: groupIdByDimension[groupBy] || "$status",
      count: { $sum: 1 },
      totalHours: { $sum: "$totalHours" },
    },
  });

  pipeline.push({ $sort: { _id: 1 } });

  const rows = await Attendance.aggregate(pipeline);

  return {
    range: { startDate: startDate || null, endDate: endDate || null },
    department: department || null,
    groupBy,
    rows: rows.map((row) => ({
      group: row._id,
      count: row.count,
      totalHours: Number((row.totalHours || 0).toFixed(2)),
    })),
  };
};

/**
 * Row-level (not aggregated) attendance records for CSV export, same
 * filters as getAttendanceReport.
 */
export const getAttendanceReportRows = async ({ startDate, endDate, department } = {}) => {
  const match = {};
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = getStartOfDay(new Date(startDate));
    if (endDate) match.date.$lte = getStartOfDay(new Date(endDate));
  }

  let query = Attendance.find(match).populate("user", "name email department").sort({ date: -1 });
  const records = await query;

  return department ? records.filter((r) => r.user?.department === department) : records;
};

export const getDashboardStats = async () => {
  const today = getStartOfDay();

  const [totalEmployees, todayRecords] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Attendance.find({ date: today }),
  ]);

  const presentCount = todayRecords.filter((r) =>
    [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE, ATTENDANCE_STATUS.REMOTE, ATTENDANCE_STATUS.HALF_DAY].includes(
      r.status
    )
  ).length;

  const onLeaveCount = todayRecords.filter((r) => r.status === ATTENDANCE_STATUS.LEAVE).length;
  const absentCount = Math.max(totalEmployees - presentCount - onLeaveCount, 0);

  return {
    totalEmployees,
    presentEmployees: presentCount,
    absentEmployees: absentCount,
    onLeave: onLeaveCount,
    todayAttendance: todayRecords,
  };
};