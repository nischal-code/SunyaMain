import mongoose from "mongoose";
import { Task } from "../models/Task.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES, TASK_STATUS, NOTIFICATION_TYPE } from "../utils/constants.js";
import * as notificationService from "./notification.service.js";

const ADMIN_TIER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];
const MAX_ACTIVITY_ENTRIES = 50;

const isAdminTier = (role) => ADMIN_TIER_ROLES.includes(role);

/**
 * Admins/managers can access any task. Employees may only access tasks
 * they're assigned to or that they personally created.
 */
const assertCanAccessTask = (task, user) => {
  if (isAdminTier(user.role)) return;

  const isAssignee = task.assignedTo.some((id) => String(id) === String(user._id));
  const isCreator = String(task.assignedBy) === String(user._id);

  if (!isAssignee && !isCreator) {
    throw new ApiError(403, "You do not have permission to access this task");
  }
};

/**
 * Self-service actions (start/progress/complete/deliverables) are restricted
 * to the assigned employee, unless the actor is admin-tier.
 */
const assertIsAssignee = (task, user) => {
  if (isAdminTier(user.role)) return;

  const isAssignee = task.assignedTo.some((id) => String(id) === String(user._id));
  if (!isAssignee) {
    throw new ApiError(403, "Only an employee assigned to this task can perform this action");
  }
};

const pushActivity = (task, action, by, meta = null) => {
  task.activityLog.push({ action, by, meta, at: new Date() });
  if (task.activityLog.length > MAX_ACTIVITY_ENTRIES) {
    task.activityLog = task.activityLog.slice(-MAX_ACTIVITY_ENTRIES);
  }
};

const populateTask = (id) =>
  Task.findOne({ _id: id, isDeleted: false })
    .populate("assignedTo", "name email department designation profilePicture")
    .populate("assignedBy", "name email")
    .populate("comments.user", "name email profilePicture")
    .populate("activityLog.by", "name email")
    .populate("attachments.uploadedBy", "name email")
    .populate("deliverables.uploadedBy", "name email");

const assertAssigneesAreValid = async (userIds) => {
  const validCount = await User.countDocuments({ _id: { $in: userIds }, isActive: true });
  if (validCount !== userIds.length) {
    throw new ApiError(400, "One or more assigned employees are invalid or inactive");
  }
};

// ------------------ Admin/Manager operations ------------------

export const createTask = async (payload, createdBy) => {
  const { title, description, project, assignedTo, priority, dueDate } = payload;

  await assertAssigneesAreValid(assignedTo);

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo,
    priority,
    dueDate,
    assignedBy: createdBy,
    activityLog: [{ action: "created", by: createdBy, meta: { assignedTo } }],
  });

  await notificationService.notifyMany(assignedTo, {
    type: NOTIFICATION_TYPE.TASK_ASSIGNED,
    title: "New task assigned",
    message: `You have been assigned a new task: "${task.title}"`,
    task: task._id,
  });

  return populateTask(task._id);
};

const EDITABLE_FIELDS = ["title", "description", "project", "priority", "dueDate"];

export const updateTask = async (taskId, updates, updatedBy) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");

  const changed = {};
  for (const field of EDITABLE_FIELDS) {
    if (updates[field] !== undefined && String(task[field] ?? "") !== String(updates[field] ?? "")) {
      changed[field] = { from: task[field], to: updates[field] };
      task[field] = updates[field];
    }
  }

  if (Object.keys(changed).length === 0) {
    return populateTask(taskId);
  }

  pushActivity(task, "updated", updatedBy, changed);
  await task.save();

  await notificationService.notifyMany(task.assignedTo, {
    type: NOTIFICATION_TYPE.TASK_UPDATED,
    title: "Task updated",
    message: `Task "${task.title}" has been updated`,
    task: task._id,
  });

  return populateTask(taskId);
};

export const deleteTask = async (taskId, deletedBy) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");

  task.isDeleted = true;
  pushActivity(task, "deleted", deletedBy);
  await task.save();

  return task;
};

export const reassignTask = async (taskId, newAssignedTo, reassignedBy) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");

  await assertAssigneesAreValid(newAssignedTo);

  const previous = task.assignedTo.map(String);
  const next = newAssignedTo.map(String);
  const added = next.filter((id) => !previous.includes(id));
  const removed = previous.filter((id) => !next.includes(id));

  task.assignedTo = newAssignedTo;
  pushActivity(task, "reassigned", reassignedBy, { added, removed });
  await task.save();

  if (added.length) {
    await notificationService.notifyMany(added, {
      type: NOTIFICATION_TYPE.TASK_REASSIGNED,
      title: "Task assigned to you",
      message: `You have been assigned to task: "${task.title}"`,
      task: task._id,
    });
  }
  if (removed.length) {
    await notificationService.notifyMany(removed, {
      type: NOTIFICATION_TYPE.TASK_REASSIGNED,
      title: "Removed from task",
      message: `You have been removed from task: "${task.title}"`,
      task: task._id,
    });
  }

  return populateTask(taskId);
};

export const changeStatus = async (taskId, status, changedBy) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");

  if (task.status === status) return populateTask(taskId);

  const previousStatus = task.status;
  task.status = status;

  if (status === TASK_STATUS.IN_PROGRESS && !task.startedAt) task.startedAt = new Date();

  if (status === TASK_STATUS.COMPLETED) {
    task.completedAt = new Date();
    task.progress = 100;
  } else if (previousStatus === TASK_STATUS.COMPLETED) {
    task.completedAt = null;
  }

  pushActivity(task, "status_changed", changedBy, { from: previousStatus, to: status });
  await task.save();

  await notificationService.notifyMany(task.assignedTo, {
    type: NOTIFICATION_TYPE.TASK_STATUS_CHANGED,
    title: "Task status changed",
    message: `Task "${task.title}" status changed to ${status.replace("_", " ")}`,
    task: task._id,
  });

  return populateTask(taskId);
};

export const addAttachments = async (taskId, user, files) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");
  assertCanAccessTask(task, user);

  const attachments = files.map((file) => ({
    url: file.path,
    publicId: file.filename,
    name: file.originalname,
    fileType: file.mimetype,
    uploadedBy: user._id,
  }));

  task.attachments.push(...attachments);
  pushActivity(task, "attachment_added", user._id, { count: files.length });
  await task.save();

  return populateTask(taskId);
};

// ------------------ Employee self-service operations ------------------

export const startTask = async (taskId, user) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");
  assertIsAssignee(task, user);

  if (task.status !== TASK_STATUS.PENDING) {
    throw new ApiError(400, `Task cannot be started from status "${task.status}"`);
  }

  task.status = TASK_STATUS.IN_PROGRESS;
  task.startedAt = new Date();
  pushActivity(task, "started", user._id);
  await task.save();

  return populateTask(taskId);
};

export const updateProgress = async (taskId, user, progress) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");
  assertIsAssignee(task, user);

  if ([TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED].includes(task.status)) {
    throw new ApiError(400, `Cannot update progress on a ${task.status} task`);
  }

  task.progress = progress;
  pushActivity(task, "progress_updated", user._id, { progress });
  await task.save();

  return populateTask(taskId);
};

export const addDeliverables = async (taskId, user, files) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");
  assertIsAssignee(task, user);

  const deliverables = files.map((file) => ({
    url: file.path,
    publicId: file.filename,
    name: file.originalname,
    fileType: file.mimetype,
    uploadedBy: user._id,
  }));

  task.deliverables.push(...deliverables);
  pushActivity(task, "deliverable_uploaded", user._id, { count: files.length });
  await task.save();

  await notificationService.notifyMany([task.assignedBy], {
    type: NOTIFICATION_TYPE.TASK_UPDATED,
    title: "Deliverable uploaded",
    message: `${user.name} uploaded a deliverable for task "${task.title}"`,
    task: task._id,
  });

  return populateTask(taskId);
};

export const markComplete = async (taskId, user) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");
  assertIsAssignee(task, user);

  if (![TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW].includes(task.status)) {
    throw new ApiError(400, "Task must be in progress or in review before it can be marked complete");
  }

  task.status = TASK_STATUS.COMPLETED;
  task.progress = 100;
  task.completedAt = new Date();
  pushActivity(task, "completed", user._id);
  await task.save();

  await notificationService.notifyMany([task.assignedBy], {
    type: NOTIFICATION_TYPE.TASK_STATUS_CHANGED,
    title: "Task marked complete",
    message: `Task "${task.title}" has been marked complete by ${user.name}`,
    task: task._id,
  });

  return populateTask(taskId);
};

// ------------------ Shared operations ------------------

export const addComment = async (taskId, user, text) => {
  const task = await Task.findOne({ _id: taskId, isDeleted: false });
  if (!task) throw new ApiError(404, "Task not found");
  assertCanAccessTask(task, user);

  task.comments.push({ user: user._id, text });
  pushActivity(task, "comment_added", user._id);
  await task.save();

  const notifyTargets = new Set([String(task.assignedBy), ...task.assignedTo.map(String)]);
  notifyTargets.delete(String(user._id));

  await notificationService.notifyMany([...notifyTargets], {
    type: NOTIFICATION_TYPE.TASK_COMMENT_ADDED,
    title: "New comment on task",
    message: `${user.name} commented on task "${task.title}"`,
    task: task._id,
  });

  return populateTask(taskId);
};

export const getTaskById = async (taskId, user) => {
  const task = await populateTask(taskId);
  if (!task) throw new ApiError(404, "Task not found");
  assertCanAccessTask(task, user);
  return task;
};

/**
 * Paginated, searchable, sortable, filterable task listing.
 * `filters.assignedTo` is force-set by the controller for non-admin roles.
 */
export const listTasks = async (filters = {}, options = {}) => {
  const { status, priority, project, assignedTo, assignedBy, search, dueBefore, dueAfter } = filters;
  const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = options;

  const query = { isDeleted: false };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (project) query.project = project;
  if (assignedTo) query.assignedTo = assignedTo;
  if (assignedBy) query.assignedBy = assignedBy;

  if (dueBefore || dueAfter) {
    query.dueDate = {};
    if (dueAfter) query.dueDate.$gte = new Date(dueAfter);
    if (dueBefore) query.dueDate.$lte = new Date(dueBefore);
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { project: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("assignedTo", "name email department designation profilePicture")
      .populate("assignedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Flattens each task's embedded activityLog into a single recent-activity
 * feed for a user (tasks they're assigned to or created), most recent first.
 */
export const getRecentActivity = async (userId, limit = 10) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const activity = await Task.aggregate([
    {
      $match: {
        isDeleted: false,
        $or: [{ assignedTo: userObjectId }, { assignedBy: userObjectId }],
      },
    },
    { $unwind: "$activityLog" },
    { $sort: { "activityLog.at": -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "activityLog.by",
        foreignField: "_id",
        as: "actor",
      },
    },
    { $unwind: { path: "$actor", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        taskId: "$_id",
        taskTitle: "$title",
        action: "$activityLog.action",
        meta: "$activityLog.meta",
        at: "$activityLog.at",
        actor: { _id: "$actor._id", name: "$actor.name" },
      },
    },
  ]);

  return activity;
};

/**
 * Status-count breakdown for a given assignee filter, zero-filled so the
 * dashboard doesn't need to special-case missing statuses.
 */
export const getStatusCounts = async (assignedTo) => {
  const results = await Task.aggregate([
    { $match: { assignedTo: new mongoose.Types.ObjectId(assignedTo), isDeleted: false } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const counts = Object.values(TASK_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  results.forEach((r) => {
    counts[r._id] = r.count;
  });

  return counts;
};

/**
 * Distinct projects an employee has active tasks in, with per-project
 * progress. Powers the "Assigned Projects" dashboard card.
 */
export const getAssignedProjects = async (userId) => {
  return Task.aggregate([
    {
      $match: {
        assignedTo: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        project: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$project",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ["$status", TASK_STATUS.COMPLETED] }, 1, 0] },
        },
      },
    },
    { $project: { _id: 0, project: "$_id", totalTasks: 1, completedTasks: 1 } },
    { $sort: { totalTasks: -1 } },
  ]);
};
