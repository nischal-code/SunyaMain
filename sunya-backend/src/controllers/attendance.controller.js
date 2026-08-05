import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import * as attendanceService from "../services/attendance.service.js";
import { Attendance } from "../models/Attendance.model.js";
import { ACTIVITY_MODULE, ACTIVITY_ACTION } from "../utils/constants.js";
import { logActivity } from "../services/activityLog.service.js";

export const clockIn = asyncHandler(async (req, res) => {
  const record = await attendanceService.clockIn(req.user._id, {
    isRemote: req.body.isRemote,
  });

  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTION.CLOCK_IN,
    module: ACTIVITY_MODULE.ATTENDANCE,
    resourceId: record._id,
    req,
  });

  return sendResponse(res, 200, "Clocked in successfully", { attendance: record });
});

export const clockOut = asyncHandler(async (req, res) => {
  const record = await attendanceService.clockOut(req.user._id);

  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTION.CLOCK_OUT,
    module: ACTIVITY_MODULE.ATTENDANCE,
    resourceId: record._id,
    req,
  });

  return sendResponse(res, 200, "Clocked out successfully", { attendance: record });
});

export const getMyAttendanceHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate, page, limit } = req.query;

  const result = await attendanceService.getAttendanceHistory(req.user._id, {
    startDate,
    endDate,
    page,
    limit,
  });

  return sendResponse(res, 200, "Attendance history fetched successfully", result);
});

export const getTodayAttendance = asyncHandler(async (req, res) => {
  const today = attendanceService.getStartOfDay();
  const record = await Attendance.findOne({ user: req.user._id, date: today });

  return sendResponse(res, 200, "Today's attendance fetched successfully", { attendance: record });
});

// ------------------ Admin/Manager: view any employee's attendance ------------------
export const getUserAttendanceHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate, page, limit } = req.query;

  const result = await attendanceService.getAttendanceHistory(userId, {
    startDate,
    endDate,
    page,
    limit,
  });

  return sendResponse(res, 200, "Employee attendance history fetched successfully", result);
});

export const getAllAttendanceToday = asyncHandler(async (req, res) => {
  const today = attendanceService.getStartOfDay();
  const records = await Attendance.find({ date: today }).populate(
    "user",
    "name email department designation"
  );

  return sendResponse(res, 200, "Today's attendance for all employees fetched", { records });
});

// ------------------ Self-service: monthly summary ------------------
export const getMySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const summary = await attendanceService.getMySummary(req.user._id, { month, year });

  return sendResponse(res, 200, "Attendance summary fetched successfully", summary);
});

// ------------------ Admin/Manager: org-wide attendance list ------------------
export const listAttendance = asyncHandler(async (req, res) => {
  const { userId, department, status, startDate, endDate, search, page, limit } = req.query;

  const filter = {};
  if (userId) filter.user = userId;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = attendanceService.getStartOfDay(new Date(startDate));
    if (endDate) filter.date.$lte = attendanceService.getStartOfDay(new Date(endDate));
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 30;
  const skip = (pageNum - 1) * limitNum;

  let query = Attendance.find(filter).populate("user", "name email department designation");

  if (department || search) {
    // department/search filter on the populated user — fetch then filter,
    // since these aren't fields on the Attendance document itself.
    const all = await query.sort({ date: -1 });
    let filtered = all;
    if (department) filtered = filtered.filter((r) => r.user?.department === department);
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((r) => r.user?.name?.toLowerCase().includes(term));
    }
    const total = filtered.length;
    const records = filtered.slice(skip, skip + limitNum);
    return sendResponse(res, 200, "Attendance list fetched successfully", {
      records,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  }

  const [records, total] = await Promise.all([
    query.sort({ date: -1 }).skip(skip).limit(limitNum),
    Attendance.countDocuments(filter),
  ]);

  return sendResponse(res, 200, "Attendance list fetched successfully", {
    records,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// ------------------ Admin/Manager: manual attendance management ------------------
export const createManualAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.createManualAttendance(req.body);
  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTION.ATTENDANCE_CREATED,
    module: ACTIVITY_MODULE.ATTENDANCE,
    resourceId: record._id,
    req,
  });
  return sendResponse(res, 201, "Manual attendance record saved", { attendance: record });
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.updateAttendanceRecord(req.params.attendanceId, req.body);
  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTION.ATTENDANCE_UPDATED,
    module: ACTIVITY_MODULE.ATTENDANCE,
    resourceId: req.params.attendanceId,
    req,
  });
  return sendResponse(res, 200, "Attendance record updated", { attendance: record });
});

export const deleteAttendance = asyncHandler(async (req, res) => {
  await attendanceService.deleteAttendanceRecord(req.params.attendanceId);
  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTION.ATTENDANCE_DELETED,
    module: ACTIVITY_MODULE.ATTENDANCE,
    resourceId: req.params.attendanceId,
    req,
  });
  return sendResponse(res, 200, "Attendance record deleted", null);
});

// ------------------ Reports ------------------
export const getAttendanceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, department, groupBy } = req.query;
  const report = await attendanceService.getAttendanceReport({ startDate, endDate, department, groupBy });

  return sendResponse(res, 200, "Attendance report fetched successfully", report);
});

const csvEscape = (value) => {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const exportAttendanceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, department } = req.query;
  const rows = await attendanceService.getAttendanceReportRows({ startDate, endDate, department });

  const header = ["Name", "Email", "Department", "Date", "Status", "Clock In", "Clock Out", "Total Hours", "Remote", "Notes"];
  const lines = [header.join(",")];

  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.user?.name),
        csvEscape(r.user?.email),
        csvEscape(r.user?.department),
        csvEscape(r.date?.toISOString().slice(0, 10)),
        csvEscape(r.status),
        csvEscape(r.clockIn?.toISOString() ?? ""),
        csvEscape(r.clockOut?.toISOString() ?? ""),
        csvEscape(r.totalHours),
        csvEscape(r.isRemote),
        csvEscape(r.notes),
      ].join(",")
    );
  }

  const csv = lines.join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="attendance-report-${Date.now()}.csv"`);
  return res.status(200).send(csv);
});