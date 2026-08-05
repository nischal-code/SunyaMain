import mongoose from "mongoose";
import { Task } from "../models/Task.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { Project } from "../models/Project.model.js";
import { User } from "../models/User.model.js";
import { getStartOfDay } from "./attendance.service.js";
import { TASK_STATUS, ATTENDANCE_STATUS } from "../utils/constants.js";

/**
 * Employee Productivity Analytics.
 *
 * Read-only reporting layer built entirely on MongoDB aggregation
 * pipelines over the existing Task / Attendance / Project collections.
 * Nothing here writes data or touches logging/dashboard integrations —
 * it only aggregates what those features already produce.
 */

const PENDING_TASK_STATUSES = [TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW];

// Attendance statuses counted as "present-like" for attendance-rate purposes.
const PRESENT_LIKE_STATUSES = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.LATE,
  ATTENDANCE_STATUS.HALF_DAY,
  ATTENDANCE_STATUS.REMOTE,
];

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

/**
 * Resolves an inclusive [start, end] Date range. Falls back to the last
 * `defaultDays` days (ending "now") when `from` is omitted.
 */
const resolveRange = (from, to, defaultDays = 30) => {
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);

  const start = from ? new Date(from) : new Date(end);
  if (!from) {
    start.setDate(start.getDate() - (defaultDays - 1));
  }
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

const currentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

/** Monday-based start of the week containing `date`. */
const startOfWeek = (date) => {
  const d = getStartOfDay(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const groupCountsById = (rows) =>
  rows.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

// ------------------ Tasks Completed ------------------

/**
 * Total completed tasks for a user within an optional date range (scoped
 * to `completedAt`), with a priority breakdown.
 */
export const getTasksCompleted = async (userId, { from, to } = {}) => {
  const match = { assignedTo: toObjectId(userId), isDeleted: false, status: TASK_STATUS.COMPLETED };

  if (from || to) {
    const { start, end } = resolveRange(from, to);
    match.completedAt = { $gte: start, $lte: end };
  }

  const [result] = await Task.aggregate([
    { $match: match },
    {
      $facet: {
        total: [{ $count: "count" }],
        byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
      },
    },
  ]);

  return {
    totalCompleted: result?.total[0]?.count || 0,
    byPriority: groupCountsById(result?.byPriority || []),
  };
};

// ------------------ Tasks Pending ------------------

/**
 * Total tasks not yet completed or cancelled for a user, broken down by
 * status (pending / in_progress / review).
 */
export const getTasksPending = async (userId) => {
  const [result] = await Task.aggregate([
    {
      $match: {
        assignedTo: toObjectId(userId),
        isDeleted: false,
        status: { $in: PENDING_TASK_STATUSES },
      },
    },
    {
      $facet: {
        total: [{ $count: "count" }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      },
    },
  ]);

  return {
    totalPending: result?.total[0]?.count || 0,
    byStatus: groupCountsById(result?.byStatus || []),
  };
};

// ------------------ Average Completion Time ------------------

/**
 * Mean duration (in hours/days) between a task starting — or being
 * created, if it was never explicitly started — and its completion.
 */
export const getAverageCompletionTime = async (userId, { from, to } = {}) => {
  const match = {
    assignedTo: toObjectId(userId),
    isDeleted: false,
    status: TASK_STATUS.COMPLETED,
    completedAt: { $ne: null },
  };

  if (from || to) {
    const { start, end } = resolveRange(from, to);
    match.completedAt = { ...match.completedAt, $gte: start, $lte: end };
  }

  const [result] = await Task.aggregate([
    { $match: match },
    {
      $project: {
        durationHours: {
          $divide: [{ $subtract: ["$completedAt", { $ifNull: ["$startedAt", "$createdAt"] }] }, 1000 * 60 * 60],
        },
      },
    },
    {
      $group: {
        _id: null,
        averageHours: { $avg: "$durationHours" },
        minHours: { $min: "$durationHours" },
        maxHours: { $max: "$durationHours" },
        sampleSize: { $sum: 1 },
      },
    },
  ]);

  if (!result) {
    return { averageHours: 0, averageDays: 0, minHours: 0, maxHours: 0, sampleSize: 0 };
  }

  return {
    averageHours: Number(result.averageHours.toFixed(2)),
    averageDays: Number((result.averageHours / 24).toFixed(2)),
    minHours: Number(result.minHours.toFixed(2)),
    maxHours: Number(result.maxHours.toFixed(2)),
    sampleSize: result.sampleSize,
  };
};

// ------------------ Project Participation ------------------

/**
 * Formal Projects the user participates in (as manager or team member),
 * broken down by project status, plus a count of distinct free-text
 * `project` labels from their tasks (ad-hoc/legacy project references).
 */
export const getProjectParticipation = async (userId) => {
  const userObjectId = toObjectId(userId);

  const [projectAgg, taskProjectAgg] = await Promise.all([
    Project.aggregate([
      {
        $match: {
          isDeleted: false,
          $or: [{ projectManager: userObjectId }, { team: userObjectId }],
        },
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          asManager: [{ $match: { projectManager: userObjectId } }, { $count: "count" }],
        },
      },
    ]),
    Task.aggregate([
      { $match: { assignedTo: userObjectId, isDeleted: false, project: { $nin: [null, ""] } } },
      { $group: { _id: "$project" } },
      { $count: "count" },
    ]),
  ]);

  const projectResult = projectAgg[0] || {};
  const total = projectResult.total?.[0]?.count || 0;
  const asManager = projectResult.asManager?.[0]?.count || 0;

  return {
    totalProjects: total,
    asManager,
    asMember: Math.max(total - asManager, 0),
    byStatus: groupCountsById(projectResult.byStatus || []),
    distinctTaskProjects: taskProjectAgg[0]?.count || 0,
  };
};

// ------------------ Attendance Rate ------------------

/**
 * Percentage of recorded attendance days the user was present-like
 * (present/late/half-day/remote), over an optional date range. Defaults
 * to the current calendar month when no range is given.
 */
export const getAttendanceRate = async (userId, { from, to } = {}) => {
  const { start, end } = from || to ? resolveRange(from, to) : currentMonthRange();

  const statusCounts = await Attendance.aggregate([
    { $match: { user: toObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: "$status", count: { $sum: 1 }, totalHours: { $sum: "$totalHours" } } },
  ]);

  const counts = groupCountsById(statusCounts);
  const totalHours = statusCounts.reduce((sum, row) => sum + (row.totalHours || 0), 0);
  const totalRecordedDays = statusCounts.reduce((sum, row) => sum + row.count, 0);
  const presentDays = PRESENT_LIKE_STATUSES.reduce((sum, status) => sum + (counts[status] || 0), 0);

  return {
    range: { from: start, to: end },
    totalRecordedDays,
    presentDays,
    attendanceRate: totalRecordedDays > 0 ? Number(((presentDays / totalRecordedDays) * 100).toFixed(2)) : 0,
    totalHours: Number(totalHours.toFixed(2)),
    counts,
  };
};

// ------------------ Daily / Weekly / Monthly Productivity ------------------

/**
 * Builds a per-calendar-day productivity trend (tasks completed + hours
 * worked + attendance status) across an inclusive date range.
 */
const getDailyTrend = async (userId, start, end) => {
  const userObjectId = toObjectId(userId);

  const [taskDaily, attendanceDaily] = await Promise.all([
    Task.aggregate([
      {
        $match: {
          assignedTo: userObjectId,
          isDeleted: false,
          status: TASK_STATUS.COMPLETED,
          completedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          tasksCompleted: { $sum: 1 },
        },
      },
    ]),
    Attendance.aggregate([
      { $match: { user: userObjectId, date: { $gte: start, $lte: end } } },
      {
        $project: {
          _id: 0,
          day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          status: 1,
          totalHours: 1,
        },
      },
    ]),
  ]);

  const taskMap = taskDaily.reduce((acc, row) => {
    acc[row._id] = row.tasksCompleted;
    return acc;
  }, {});

  const attendanceMap = attendanceDaily.reduce((acc, row) => {
    acc[row.day] = { status: row.status, hoursWorked: row.totalHours || 0 };
    return acc;
  }, {});

  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({
      date: key,
      tasksCompleted: taskMap[key] || 0,
      attendanceStatus: attendanceMap[key]?.status || null,
      hoursWorked: attendanceMap[key]?.hoursWorked || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

/** Daily Productivity: single-day snapshot (defaults to today). */
export const getDailyProductivity = async (userId, { date } = {}) => {
  const day = getStartOfDay(date ? new Date(date) : new Date());
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const [snapshot] = await getDailyTrend(userId, day, dayEnd);
  return snapshot;
};

/** Weekly Productivity: 7-day (Mon-Sun) breakdown with totals. */
export const getWeeklyProductivity = async (userId, { weekStart } = {}) => {
  const start = weekStart ? getStartOfDay(new Date(weekStart)) : startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const days = await getDailyTrend(userId, start, end);
  const totals = days.reduce(
    (acc, d) => {
      acc.tasksCompleted += d.tasksCompleted;
      acc.hoursWorked += d.hoursWorked;
      return acc;
    },
    { tasksCompleted: 0, hoursWorked: 0 }
  );

  return {
    weekStart: start,
    weekEnd: end,
    days,
    totals: { tasksCompleted: totals.tasksCompleted, hoursWorked: Number(totals.hoursWorked.toFixed(2)) },
  };
};

/**
 * Single-pass Task aggregation for the monthly view: daily completed-task
 * counts and the priority breakdown share the same $match, so they're
 * computed together via $facet instead of two separate aggregate calls
 * (one for the daily trend, one for getTasksCompleted).
 */
const getMonthlyTaskStats = async (userObjectId, start, end) => {
  const [result] = await Task.aggregate([
    {
      $match: {
        assignedTo: userObjectId,
        isDeleted: false,
        status: TASK_STATUS.COMPLETED,
        completedAt: { $gte: start, $lte: end },
      },
    },
    {
      $facet: {
        daily: [
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, tasksCompleted: { $sum: 1 } } },
        ],
        byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
      },
    },
  ]);

  const dailyMap = (result?.daily || []).reduce((acc, row) => {
    acc[row._id] = row.tasksCompleted;
    return acc;
  }, {});

  return { dailyMap, byPriority: groupCountsById(result?.byPriority || []) };
};

/**
 * Single-pass Attendance aggregation for the monthly view: the per-day
 * status/hours map and the attendance-rate counts share the same $match,
 * computed together via $facet instead of two separate aggregate calls
 * (one for the daily trend, one for getAttendanceRate).
 */
const getMonthlyAttendanceStats = async (userObjectId, start, end) => {
  const [result] = await Attendance.aggregate([
    { $match: { user: userObjectId, date: { $gte: start, $lte: end } } },
    {
      $facet: {
        daily: [
          {
            $project: {
              _id: 0,
              day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              status: 1,
              totalHours: 1,
            },
          },
        ],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 }, totalHours: { $sum: "$totalHours" } } }],
      },
    },
  ]);

  const dailyMap = (result?.daily || []).reduce((acc, row) => {
    acc[row.day] = { status: row.status, hoursWorked: row.totalHours || 0 };
    return acc;
  }, {});

  const statusRows = result?.byStatus || [];
  const counts = groupCountsById(statusRows);
  const totalHours = statusRows.reduce((sum, row) => sum + (row.totalHours || 0), 0);
  const totalRecordedDays = statusRows.reduce((sum, row) => sum + row.count, 0);
  const presentDays = PRESENT_LIKE_STATUSES.reduce((sum, status) => sum + (counts[status] || 0), 0);

  return {
    dailyMap,
    attendanceRate: {
      range: { from: start, to: end },
      totalRecordedDays,
      presentDays,
      attendanceRate: totalRecordedDays > 0 ? Number(((presentDays / totalRecordedDays) * 100).toFixed(2)) : 0,
      totalHours: Number(totalHours.toFixed(2)),
      counts,
    },
  };
};

/** Monthly Productivity: daily breakdown across a calendar month + totals. */
export const getMonthlyProductivity = async (userId, { month, year } = {}) => {
  const now = new Date();
  const resolvedYear = year ?? now.getFullYear();
  const resolvedMonth = month ? month - 1 : now.getMonth();

  const start = new Date(resolvedYear, resolvedMonth, 1);
  const end = new Date(resolvedYear, resolvedMonth + 1, 0, 23, 59, 59, 999);
  const userObjectId = toObjectId(userId);

  // 2 aggregate calls instead of the 4 that getDailyTrend + getTasksCompleted
  // + getAttendanceRate would issue separately for this same range.
  const [taskStats, attendanceStats] = await Promise.all([
    getMonthlyTaskStats(userObjectId, start, end),
    getMonthlyAttendanceStats(userObjectId, start, end),
  ]);

  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({
      date: key,
      tasksCompleted: taskStats.dailyMap[key] || 0,
      attendanceStatus: attendanceStats.dailyMap[key]?.status || null,
      hoursWorked: attendanceStats.dailyMap[key]?.hoursWorked || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const totals = days.reduce(
    (acc, d) => {
      acc.tasksCompleted += d.tasksCompleted;
      acc.hoursWorked += d.hoursWorked;
      return acc;
    },
    { tasksCompleted: 0, hoursWorked: 0 }
  );

  return {
    month: resolvedMonth + 1,
    year: resolvedYear,
    days,
    totals: { tasksCompleted: totals.tasksCompleted, hoursWorked: Number(totals.hoursWorked.toFixed(2)) },
    tasksCompletedByPriority: taskStats.byPriority,
    attendanceRate: attendanceStats.attendanceRate,
  };
};

// ------------------ Overall Productivity Score ------------------
//
// These endpoints (org overview, leaderboard, employee summary, employee
// trend) weren't part of the original per-metric analytics above — they
// combine those metrics into a single 0-100 "productivity score" per
// employee per period, used by the frontend's productivity dashboard and
// leaderboard views.
//
// score = 50% on-time task completion rate + 30% attendance rate +
//         20% task volume (tasks completed vs. a per-period target,
//         capped at 100%).

const VOLUME_TARGET_BY_PERIOD = { week: 3, month: 10, quarter: 30 };

const monthRangeFor = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const quarterRangeFor = (date) => {
  const quarterIndex = Math.floor(date.getMonth() / 3);
  const start = new Date(date.getFullYear(), quarterIndex * 3, 1);
  const end = new Date(date.getFullYear(), quarterIndex * 3 + 3, 0, 23, 59, 59, 999);
  return { start, end };
};

const weekRangeFor = (date) => {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/** Resolves the [start, end] range for a named period ("week"|"month"|"quarter"), defaulting to "month". */
const resolvePeriodRange = (period = "month", referenceDate = new Date()) => {
  if (period === "week") return weekRangeFor(referenceDate);
  if (period === "quarter") return quarterRangeFor(referenceDate);
  return monthRangeFor(referenceDate);
};

/** Reference date for the period immediately before the one containing `referenceDate`. */
const previousPeriodReferenceDate = (period, referenceDate) => {
  const d = new Date(referenceDate);
  if (period === "week") {
    d.setDate(d.getDate() - 7);
  } else if (period === "quarter") {
    d.setMonth(d.getMonth() - 3);
  } else {
    d.setMonth(d.getMonth() - 1);
  }
  return d;
};

/** Completed-task count + on-time rate within [start, end] (tasks with no dueDate count as on-time). */
const getOnTimeStats = async (userId, start, end) => {
  const [result] = await Task.aggregate([
    {
      $match: {
        assignedTo: toObjectId(userId),
        isDeleted: false,
        status: TASK_STATUS.COMPLETED,
        completedAt: { $gte: start, $lte: end },
      },
    },
    {
      $project: {
        onTime: {
          $cond: [{ $eq: ["$dueDate", null] }, true, { $lte: ["$completedAt", "$dueDate"] }],
        },
      },
    },
    { $group: { _id: null, total: { $sum: 1 }, onTime: { $sum: { $cond: ["$onTime", 1, 0] } } } },
  ]);

  const total = result?.total || 0;
  const onTime = result?.onTime || 0;

  return {
    tasksCompleted: total,
    tasksOnTime: onTime,
    onTimeRate: total > 0 ? Number(((onTime / total) * 100).toFixed(2)) : 0,
  };
};

/** The composite 0-100 productivity score for one user within [start, end]. */
const computeScoreForRange = async (userId, start, end, period = "month") => {
  const [onTimeStats, attendance, avgCompletion] = await Promise.all([
    getOnTimeStats(userId, start, end),
    getAttendanceRate(userId, { from: start, to: end }),
    getAverageCompletionTime(userId, { from: start, to: end }),
  ]);

  const target = VOLUME_TARGET_BY_PERIOD[period] || VOLUME_TARGET_BY_PERIOD.month;
  const volumeScore = Math.min(100, (onTimeStats.tasksCompleted / target) * 100);
  const rawScore = 0.5 * onTimeStats.onTimeRate + 0.3 * attendance.attendanceRate + 0.2 * volumeScore;

  return {
    score: Math.max(0, Math.min(100, Math.round(rawScore))),
    tasksCompleted: onTimeStats.tasksCompleted,
    tasksOnTime: onTimeStats.tasksOnTime,
    onTimeRate: onTimeStats.onTimeRate,
    attendanceRate: attendance.attendanceRate,
    avgCompletionHours: avgCompletion.averageHours,
  };
};

/**
 * The authenticated (or, for admin-tier lookups, targeted) employee's own
 * productivity summary for a period, plus their score for the prior
 * equivalent period and their rank among department peers (or all active
 * employees, if they have no department set).
 */
export const getEmployeeSummary = async (userId, { period = "month", month, year } = {}) => {
  let referenceDate = new Date();
  if (period === "month" && (month || year)) {
    const now = new Date();
    referenceDate = new Date(year ?? now.getFullYear(), (month ?? now.getMonth() + 1) - 1, 1);
  }

  const { start, end } = resolvePeriodRange(period, referenceDate);
  const current = await computeScoreForRange(userId, start, end, period);

  const prevRange = resolvePeriodRange(period, previousPeriodReferenceDate(period, referenceDate));
  const previous = await computeScoreForRange(userId, prevRange.start, prevRange.end, period);

  const user = await User.findById(userId).select("department").lean();
  const peerFilter = { isActive: true };
  if (user?.department) peerFilter.department = user.department;

  const peers = await User.find(peerFilter).select("_id").lean();
  const peerScores = await Promise.all(
    peers.map(async (peer) => ({
      userId: String(peer._id),
      score: (await computeScoreForRange(peer._id, start, end, period)).score,
    }))
  );
  peerScores.sort((a, b) => b.score - a.score);
  const rankIndex = peerScores.findIndex((p) => p.userId === String(userId));

  return {
    period,
    score: current.score,
    tasksCompleted: current.tasksCompleted,
    tasksOnTime: current.tasksOnTime,
    onTimeRate: current.onTimeRate,
    attendanceRate: current.attendanceRate,
    avgCompletionHours: current.avgCompletionHours,
    previousScore: previous.score,
    rank: rankIndex >= 0 ? rankIndex + 1 : null,
    rankOutOf: peerScores.length,
  };
};

/** A series of { label, score } points, one per period, for a score-over-time chart. */
export const getEmployeeTrend = async (userId, { period = "monthly", range = 6 } = {}) => {
  const normalizedPeriod = period === "weekly" ? "week" : "month";
  const rangeNum = Math.max(1, Number(range) || 6);
  const now = new Date();

  const referenceDates = [];
  for (let i = rangeNum - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    if (normalizedPeriod === "week") {
      d.setDate(d.getDate() - i * 7);
    } else {
      d.setMonth(d.getMonth() - i);
    }
    referenceDates.push(d);
  }

  const points = [];
  for (const refDate of referenceDates) {
    const { start, end } = resolvePeriodRange(normalizedPeriod, refDate);
    // eslint-disable-next-line no-await-in-loop
    const { score } = await computeScoreForRange(userId, start, end, normalizedPeriod);
    const label =
      normalizedPeriod === "week"
        ? `${start.toLocaleString("en-US", { month: "short" })} ${start.getDate()}`
        : start.toLocaleString("en-US", { month: "short" });
    points.push({ label, score });
  }

  return { period: normalizedPeriod, points };
};

/** Org-wide productivity snapshot: average score, headcount, top performer, per-department breakdown. */
export const getOrgProductivity = async ({ period = "month", department } = {}) => {
  const { start, end } = resolvePeriodRange(period, new Date());

  const filter = { isActive: true };
  if (department) filter.department = department;

  const users = await User.find(filter).select("_id name department").lean();
  const scored = await Promise.all(
    users.map(async (u) => ({ user: u, ...(await computeScoreForRange(u._id, start, end, period)) }))
  );

  const totalEmployees = scored.length;
  const averageScore =
    totalEmployees > 0
      ? Number((scored.reduce((sum, s) => sum + s.score, 0) / totalEmployees).toFixed(2))
      : 0;

  const topPerformer = scored.reduce((top, s) => (!top || s.score > top.score ? s : top), null);

  const byDepartmentMap = {};
  for (const s of scored) {
    const dept = s.user.department || "Unassigned";
    if (!byDepartmentMap[dept]) byDepartmentMap[dept] = { department: dept, total: 0, count: 0 };
    byDepartmentMap[dept].total += s.score;
    byDepartmentMap[dept].count += 1;
  }
  const byDepartment = Object.values(byDepartmentMap).map((d) => ({
    department: d.department,
    averageScore: Number((d.total / d.count).toFixed(2)),
    employeeCount: d.count,
  }));

  return {
    period,
    averageScore,
    totalEmployees,
    topPerformer: topPerformer
      ? { userId: topPerformer.user._id, name: topPerformer.user.name, score: topPerformer.score }
      : null,
    byDepartment,
  };
};

/** Ranked, paginated list of employees by productivity score for a period. */
export const getLeaderboard = async ({ period = "month", department, page = 1, limit = 20, sortOrder = "desc" } = {}) => {
  const { start, end } = resolvePeriodRange(period, new Date());

  const filter = { isActive: true };
  if (department) filter.department = department;

  const users = await User.find(filter).select("_id name department designation profilePicture").lean();
  const scored = await Promise.all(
    users.map(async (u) => ({ user: u, ...(await computeScoreForRange(u._id, start, end, period)) }))
  );

  scored.sort((a, b) => (sortOrder === "asc" ? a.score - b.score : b.score - a.score));

  const total = scored.length;
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const startIdx = (pageNum - 1) * limitNum;

  const leaderboard = scored.slice(startIdx, startIdx + limitNum).map((item, idx) => ({
    rank: startIdx + idx + 1,
    userId: item.user._id,
    name: item.user.name,
    department: item.user.department,
    designation: item.user.designation,
    profilePicture: item.user.profilePicture,
    score: item.score,
    tasksCompleted: item.tasksCompleted,
    onTimeRate: item.onTimeRate,
    attendanceRate: item.attendanceRate,
  }));

  return {
    period,
    leaderboard,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};