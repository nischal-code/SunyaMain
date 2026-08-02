import mongoose from "mongoose";
import { Task } from "../models/Task.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { Project } from "../models/Project.model.js";
import * as attendanceService from "./attendance.service.js";
import * as taskService from "./task.service.js";
import * as notificationService from "./notification.service.js";
import {
  TASK_STATUS,
  ATTENDANCE_STATUS,
  UPCOMING_DEADLINE_WINDOW_DAYS,
  RUNNING_PROJECT_STATUSES,
} from "../utils/constants.js";

const ACTIVE_STATUSES = [TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW];

/**
 * Assembles everything the Employee Dashboard needs in one call.
 * `user` is the authenticated req.user document.
 */
export const getEmployeeDashboard = async (user) => {
  const userId = user._id;

  const today = attendanceService.getStartOfDay();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadlineHorizon = new Date(today);
  deadlineHorizon.setDate(deadlineHorizon.getDate() + UPCOMING_DEADLINE_WINDOW_DAYS);

  const baseFilter = { assignedTo: userId, isDeleted: false };

  const [
    todayAttendance,
    monthlyAttendance,
    todaysTasks,
    upcomingDeadlines,
    pendingTasks,
    completedTasks,
    statusCounts,
    assignedProjects,
    recentActivity,
    notifications,
  ] = await Promise.all([
    Attendance.findOne({ user: userId, date: today }).lean(),
    attendanceService.getMonthlySummary(userId, today),
    Task.find({ ...baseFilter, dueDate: { $gte: today, $lt: tomorrow }, status: { $in: ACTIVE_STATUSES } })
      .populate("assignedBy", "name email")
      .sort({ priority: -1 })
      .lean(),
    Task.find({
      ...baseFilter,
      dueDate: { $gte: tomorrow, $lte: deadlineHorizon },
      status: { $in: ACTIVE_STATUSES },
    })
      .populate("assignedBy", "name email")
      .sort({ dueDate: 1 })
      .limit(10)
      .lean(),
    Task.find({ ...baseFilter, status: TASK_STATUS.PENDING })
      .populate("assignedBy", "name email")
      .sort({ dueDate: 1 })
      .limit(10)
      .lean(),
    Task.find({ ...baseFilter, status: TASK_STATUS.COMPLETED })
      .populate("assignedBy", "name email")
      .sort({ completedAt: -1 })
      .limit(10)
      .lean(),
    taskService.getStatusCounts(userId),
    taskService.getAssignedProjects(userId),
    taskService.getRecentActivity(userId, 10),
    notificationService.getUserNotifications(userId, { page: 1, limit: 10 }),
  ]);

  return {
    welcome: {
      name: user.name,
      role: user.role,
      designation: user.designation,
      department: user.department,
    },
    attendanceSummary: {
      today: todayAttendance,
      monthly: monthlyAttendance,
    },
    taskSummary: {
      counts: statusCounts,
      totalAssigned: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
    },
    todaysTasks,
    upcomingDeadlines,
    pendingTasks,
    completedTasks,
    assignedProjects,
    recentActivity,
    notifications: {
      items: notifications.notifications,
      unreadCount: notifications.unreadCount,
    },
  };
};

// ------------------ Paginated Employee Dashboard cards ------------------

const buildPagination = (page, limit, total) => ({
  total,
  page: Number(page),
  limit: Number(limit),
  totalPages: Math.ceil(total / limit) || 0,
});

/**
 * Resolves the { sort } object for the task-based cards. "deadline" means
 * nearest due date first, "newest" means most recently created first.
 * sortOrder, when provided, overrides the implied direction.
 */
const resolveTaskSort = (sortBy, sortOrder) => {
  if (sortBy === "newest") {
    return { createdAt: sortOrder === "asc" ? 1 : -1 };
  }
  return { dueDate: sortOrder === "desc" ? -1 : 1 };
};

/**
 * Resolves the { sort } object for the project-based cards. "deadline" means
 * nearest project deadline first, "newest" means most recently created
 * first. sortOrder, when provided, overrides the implied direction.
 */
const resolveProjectSort = (sortBy, sortOrder) => {
  if (sortBy === "deadline") {
    return { deadline: sortOrder === "desc" ? -1 : 1 };
  }
  return { createdAt: sortOrder === "asc" ? 1 : -1 };
};

/**
 * Today's Tasks: the authenticated user's active tasks due today.
 */
export const getTodaysTasks = async (userId, { page = 1, limit = 10, sortBy, sortOrder, search } = {}) => {
  const today = attendanceService.getStartOfDay();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const query = {
    assignedTo: userId,
    isDeleted: false,
    dueDate: { $gte: today, $lt: tomorrow },
    status: { $in: ACTIVE_STATUSES },
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = resolveTaskSort(sortBy, sortOrder);

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .select("title description project status priority dueDate progress assignedBy createdAt")
      .populate("assignedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(query),
  ]);

  return { tasks, pagination: buildPagination(page, limit, total) };
};

/**
 * Upcoming Deadlines: the authenticated user's active tasks due after today,
 * within the configured lookahead window.
 */
export const getUpcomingDeadlines = async (userId, { page = 1, limit = 10, sortBy, sortOrder, search } = {}) => {
  const today = attendanceService.getStartOfDay();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadlineHorizon = new Date(today);
  deadlineHorizon.setDate(deadlineHorizon.getDate() + UPCOMING_DEADLINE_WINDOW_DAYS);

  const query = {
    assignedTo: userId,
    isDeleted: false,
    dueDate: { $gte: tomorrow, $lte: deadlineHorizon },
    status: { $in: ACTIVE_STATUSES },
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = resolveTaskSort(sortBy, sortOrder);

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .select("title description project status priority dueDate progress assignedBy createdAt")
      .populate("assignedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(query),
  ]);

  return { tasks, pagination: buildPagination(page, limit, total) };
};

/**
 * Assigned Projects: all non-deleted projects where the authenticated user
 * is either the project manager or a team member.
 */
export const getAssignedProjects = async (userId, { page = 1, limit = 10, sortBy, sortOrder, search } = {}) => {
  const query = {
    isDeleted: false,
    $or: [{ projectManager: userId }, { team: userId }],
  };

  if (search) {
    const searchClause = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };
    query.$and = [{ $or: query.$or }, searchClause];
    delete query.$or;
  }

  const skip = (page - 1) * limit;
  const sort = resolveProjectSort(sortBy, sortOrder);

  const [projects, total] = await Promise.all([
    Project.find(query)
      .select("name description status deadline startDate progress projectManager team createdAt")
      .populate("projectManager", "name email")
      .populate("team", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(query),
  ]);

  return { projects, pagination: buildPagination(page, limit, total) };
};

/**
 * Resolves the [start, end] Date range (inclusive) for a calendar month.
 * Falls back to the current month/year when either is omitted.
 */
const resolveMonthRange = (month, year) => {
  const now = new Date();
  const resolvedYear = year ?? now.getFullYear();
  const resolvedMonth = month ? month - 1 : now.getMonth(); // JS months are 0-indexed

  const start = new Date(resolvedYear, resolvedMonth, 1);
  const end = new Date(resolvedYear, resolvedMonth + 1, 0, 23, 59, 59, 999);

  return { start, end, month: resolvedMonth + 1, year: resolvedYear };
};

/**
 * Running Projects: the authenticated user's assigned projects that are
 * currently active (excludes projects still in planning or already
 * completed).
 */
export const getRunningProjects = async (userId, { page = 1, limit = 10, sortBy, sortOrder, search } = {}) => {
  const query = {
    isDeleted: false,
    status: { $in: RUNNING_PROJECT_STATUSES },
    $or: [{ projectManager: userId }, { team: userId }],
  };

  if (search) {
    const searchClause = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };
    query.$and = [{ $or: query.$or }, searchClause];
    delete query.$or;
  }

  const skip = (page - 1) * limit;
  const sort = resolveProjectSort(sortBy, sortOrder);

  const [projects, total] = await Promise.all([
    Project.find(query)
      .select("name description status deadline startDate progress projectManager team createdAt")
      .populate("projectManager", "name email")
      .populate("team", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(query),
  ]);

  return { projects, pagination: buildPagination(page, limit, total) };
};

/**
 * Dashboard Summary: Completed Tasks, Pending Reviews, and Attendance
 * Summary (Present/Absent/Late/Total Working Days) for the authenticated
 * user, scoped to a calendar month (defaults to the current month).
 */
export const getDashboardSummary = async (userId, { month, year } = {}) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const range = resolveMonthRange(month, year);

  const [taskStats, attendanceStats] = await Promise.all([
    Task.aggregate([
      { $match: { assignedTo: userObjectId, isDeleted: false } },
      {
        $facet: {
          completedTasks: [{ $match: { status: TASK_STATUS.COMPLETED } }, { $count: "count" }],
          pendingReviews: [{ $match: { status: TASK_STATUS.REVIEW } }, { $count: "count" }],
        },
      },
    ]),
    Attendance.aggregate([
      { $match: { user: userObjectId, date: { $gte: range.start, $lte: range.end } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const completedTasks = taskStats[0]?.completedTasks[0]?.count || 0;
  const pendingReviews = taskStats[0]?.pendingReviews[0]?.count || 0;

  const attendanceCounts = attendanceStats.reduce((acc, entry) => {
    acc[entry._id] = entry.count;
    return acc;
  }, {});

  const presentDays = attendanceCounts[ATTENDANCE_STATUS.PRESENT] || 0;
  const absentDays = attendanceCounts[ATTENDANCE_STATUS.ABSENT] || 0;
  const lateDays = attendanceCounts[ATTENDANCE_STATUS.LATE] || 0;
  const totalWorkingDays = Object.values(attendanceCounts).reduce((sum, count) => sum + count, 0);

  return {
    month: range.month,
    year: range.year,
    completedTasks,
    pendingReviews,
    attendanceSummary: {
      presentDays,
      absentDays,
      lateDays,
      totalWorkingDays,
    },
  };
};
