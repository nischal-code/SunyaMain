import { Project } from "../models/Project.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES, PROJECT_STATUS, MILESTONE_STATUS, NOTIFICATION_TYPE } from "../utils/constants.js";
import * as notificationService from "./notification.service.js";

const ADMIN_TIER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const MAX_ACTIVITY_ENTRIES = 50;

const isAdminTier = (role) => ADMIN_TIER_ROLES.includes(role);

const isProjectManager = (project, user) =>
  project.projectManager && String(project.projectManager) === String(user._id);

const isTeamMember = (project, user) =>
  project.team.some((id) => String(id) === String(user._id));

/**
 * Admins can access any project. The assigned project manager and team
 * members may only access projects they belong to.
 */
const assertCanAccessProject = (project, user) => {
  if (isAdminTier(user.role)) return;
  if (isProjectManager(project, user) || isTeamMember(project, user)) return;

  throw new ApiError(403, "You do not have permission to access this project");
};

/**
 * Management actions (milestones, files, status, progress) are restricted to
 * admins and the specific project manager assigned to that project.
 */
const assertCanManageProject = (project, user) => {
  if (isAdminTier(user.role)) return;
  if (isProjectManager(project, user)) return;

  throw new ApiError(403, "Only an admin or the assigned project manager can perform this action");
};

const pushActivity = (project, action, by, meta = null) => {
  project.activityLog.push({ action, by, meta, at: new Date() });
  if (project.activityLog.length > MAX_ACTIVITY_ENTRIES) {
    project.activityLog = project.activityLog.slice(-MAX_ACTIVITY_ENTRIES);
  }
};

const populateProject = (id) =>
  Project.findOne({ _id: id, isDeleted: false })
    .populate("projectManager", "name email department designation profilePicture")
    .populate("team", "name email department designation profilePicture")
    .populate("createdBy", "name email")
    .populate("milestones.assignedTo", "name email profilePicture")
    .populate("activityLog.by", "name email")
    .populate("files.uploadedBy", "name email")
    .populate("deliverables.uploadedBy", "name email");

const assertUsersAreValid = async (userIds) => {
  if (!userIds.length) return;
  const validCount = await User.countDocuments({ _id: { $in: userIds }, isActive: true });
  if (validCount !== userIds.length) {
    throw new ApiError(400, "One or more assigned users are invalid or inactive");
  }
};

const findActiveProject = async (projectId) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
};

/**
 * Recomputes overall project progress as the average of milestone progress
 * whenever milestones exist. Falls back to leaving the manually-set value
 * untouched when there are no milestones yet.
 */
const recomputeProgress = (project) => {
  if (!project.milestones.length) return;
  const total = project.milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
  project.progress = Math.round(total / project.milestones.length);
};

// ------------------ Project CRUD ------------------

export const createProject = async (payload, createdBy) => {
  const { name, description, client, budget, deadline, startDate, projectManager, team } = payload;

  const userIdsToValidate = [...(team || [])];
  if (projectManager) userIdsToValidate.push(projectManager);
  await assertUsersAreValid(userIdsToValidate);

  const project = await Project.create({
    name,
    description,
    client,
    budget,
    deadline,
    startDate,
    projectManager: projectManager || null,
    team: team || [],
    createdBy,
    activityLog: [{ action: "created", by: createdBy }],
  });

  const notifyTargets = [...(team || [])];
  if (projectManager) notifyTargets.push(projectManager);
  if (notifyTargets.length) {
    await notificationService.notifyMany(notifyTargets, {
      type: NOTIFICATION_TYPE.PROJECT_ASSIGNED,
      title: "Assigned to new project",
      message: `You have been assigned to project: "${project.name}"`,
      project: project._id,
    });
  }

  return populateProject(project._id);
};

const EDITABLE_FIELDS = ["name", "description", "client", "startDate"];

export const updateProject = async (projectId, updates, updatedBy) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, updatedBy);

  const changed = {};
  for (const field of EDITABLE_FIELDS) {
    if (updates[field] === undefined) continue;
    const current = JSON.stringify(project[field] ?? null);
    const incoming = JSON.stringify(updates[field] ?? null);
    if (current !== incoming) {
      changed[field] = { from: project[field], to: updates[field] };
      project[field] = updates[field];
    }
  }

  if (Object.keys(changed).length === 0) {
    return populateProject(projectId);
  }

  pushActivity(project, "updated", updatedBy._id, changed);
  await project.save();

  return populateProject(projectId);
};

export const deleteProject = async (projectId, deletedBy) => {
  const project = await findActiveProject(projectId);
  if (!isAdminTier(deletedBy.role)) {
    throw new ApiError(403, "Only an admin can delete a project");
  }

  project.isDeleted = true;
  pushActivity(project, "deleted", deletedBy._id);
  await project.save();

  return project;
};

// ------------------ Team & Project Manager ------------------

export const assignTeam = async (projectId, teamIds, assignedBy) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, assignedBy);
  await assertUsersAreValid(teamIds);

  const previous = project.team.map(String);
  const next = teamIds.map(String);
  const added = next.filter((id) => !previous.includes(id));
  const removed = previous.filter((id) => !next.includes(id));

  project.team = teamIds;
  pushActivity(project, "team_updated", assignedBy._id, { added, removed });
  await project.save();

  if (added.length) {
    await notificationService.notifyMany(added, {
      type: NOTIFICATION_TYPE.PROJECT_ASSIGNED,
      title: "Assigned to project",
      message: `You have been assigned to project: "${project.name}"`,
      project: project._id,
    });
  }
  if (removed.length) {
    await notificationService.notifyMany(removed, {
      type: NOTIFICATION_TYPE.PROJECT_UPDATED,
      title: "Removed from project",
      message: `You have been removed from project: "${project.name}"`,
      project: project._id,
    });
  }

  return populateProject(projectId);
};

export const assignProjectManager = async (projectId, managerId, assignedBy) => {
  const project = await findActiveProject(projectId);
  if (!isAdminTier(assignedBy.role)) {
    throw new ApiError(403, "Only an admin can assign a project manager");
  }

  if (managerId) {
    await assertUsersAreValid([managerId]);
  }

  const previousManager = project.projectManager;
  project.projectManager = managerId || null;
  pushActivity(project, "manager_assigned", assignedBy._id, {
    from: previousManager,
    to: managerId || null,
  });
  await project.save();

  if (managerId) {
    await notificationService.notifyMany([managerId], {
      type: NOTIFICATION_TYPE.PROJECT_MANAGER_ASSIGNED,
      title: "Assigned as project manager",
      message: `You have been assigned as project manager for: "${project.name}"`,
      project: project._id,
    });
  }

  return populateProject(projectId);
};

// ------------------ Budget, Deadline, Status ------------------

export const setBudget = async (projectId, budget, updatedBy) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, updatedBy);

  const previous = project.budget?.toObject ? project.budget.toObject() : project.budget;
  project.budget = {
    amount: budget.amount ?? project.budget?.amount ?? null,
    currency: budget.currency ?? project.budget?.currency ?? "USD",
  };
  pushActivity(project, "budget_updated", updatedBy._id, { from: previous, to: project.budget });
  await project.save();

  return populateProject(projectId);
};

export const setDeadline = async (projectId, deadline, updatedBy) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, updatedBy);

  const previous = project.deadline;
  project.deadline = deadline;
  pushActivity(project, "deadline_updated", updatedBy._id, { from: previous, to: deadline });
  await project.save();

  return populateProject(projectId);
};

export const changeStatus = async (projectId, status, changedBy) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, changedBy);

  if (project.status === status) return populateProject(projectId);

  const previousStatus = project.status;
  project.status = status;

  if (status === PROJECT_STATUS.COMPLETED) {
    project.progress = 100;
  }

  pushActivity(project, "status_changed", changedBy._id, { from: previousStatus, to: status });
  await project.save();

  const notifyTargets = new Set(project.team.map(String));
  if (project.projectManager) notifyTargets.add(String(project.projectManager));

  await notificationService.notifyMany([...notifyTargets], {
    type: NOTIFICATION_TYPE.PROJECT_STATUS_CHANGED,
    title: "Project status changed",
    message: `Project "${project.name}" status changed to ${status}`,
    project: project._id,
  });

  return populateProject(projectId);
};

export const updateProgress = async (projectId, user, progress) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, user);

  project.progress = progress;
  pushActivity(project, "progress_updated", user._id, { progress });
  await project.save();

  return populateProject(projectId);
};

// ------------------ Files & Deliverables ------------------

export const addFiles = async (projectId, user, files) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, user);

  const entries = files.map((file) => ({
    url: file.path,
    publicId: file.filename,
    name: file.originalname,
    fileType: file.mimetype,
    uploadedBy: user._id,
  }));

  project.files.push(...entries);
  pushActivity(project, "file_added", user._id, { count: files.length });
  await project.save();

  return populateProject(projectId);
};

export const addDeliverables = async (projectId, user, files) => {
  const project = await findActiveProject(projectId);
  assertCanAccessProject(project, user);

  if (!isAdminTier(user.role) && !isProjectManager(project, user) && !isTeamMember(project, user)) {
    throw new ApiError(403, "Only a project member can upload deliverables");
  }

  const entries = files.map((file) => ({
    url: file.path,
    publicId: file.filename,
    name: file.originalname,
    fileType: file.mimetype,
    uploadedBy: user._id,
  }));

  project.deliverables.push(...entries);
  pushActivity(project, "deliverable_uploaded", user._id, { count: files.length });
  await project.save();

  return populateProject(projectId);
};

// ------------------ Milestones ------------------

export const addMilestone = async (projectId, user, payload) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, user);

  if (payload.assignedTo?.length) {
    await assertUsersAreValid(payload.assignedTo);
  }

  const milestone = {
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate,
    assignedTo: payload.assignedTo || [],
  };

  project.milestones.push(milestone);
  const created = project.milestones[project.milestones.length - 1];
  pushActivity(project, "milestone_created", user._id, { milestoneId: created._id, title: created.title });
  recomputeProgress(project);
  await project.save();

  if (payload.assignedTo?.length) {
    await notificationService.notifyMany(payload.assignedTo, {
      type: NOTIFICATION_TYPE.MILESTONE_ASSIGNED,
      title: "Assigned to milestone",
      message: `You have been assigned to milestone "${created.title}" on project "${project.name}"`,
      project: project._id,
    });
  }

  return populateProject(projectId);
};

const findMilestone = (project, milestoneId) => {
  const milestone = project.milestones.id(milestoneId);
  if (!milestone) throw new ApiError(404, "Milestone not found");
  return milestone;
};

const MILESTONE_EDITABLE_FIELDS = ["title", "description", "dueDate"];

export const updateMilestone = async (projectId, milestoneId, updates, user) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, user);
  const milestone = findMilestone(project, milestoneId);

  for (const field of MILESTONE_EDITABLE_FIELDS) {
    if (updates[field] !== undefined) milestone[field] = updates[field];
  }

  if (updates.assignedTo !== undefined) {
    if (updates.assignedTo.length) await assertUsersAreValid(updates.assignedTo);

    const previous = milestone.assignedTo.map(String);
    const next = updates.assignedTo.map(String);
    const added = next.filter((id) => !previous.includes(id));

    milestone.assignedTo = updates.assignedTo;

    if (added.length) {
      await notificationService.notifyMany(added, {
        type: NOTIFICATION_TYPE.MILESTONE_ASSIGNED,
        title: "Assigned to milestone",
        message: `You have been assigned to milestone "${milestone.title}" on project "${project.name}"`,
        project: project._id,
      });
    }
  }

  pushActivity(project, "milestone_updated", user._id, { milestoneId });
  await project.save();

  return populateProject(projectId);
};

export const deleteMilestone = async (projectId, milestoneId, user) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, user);
  const milestone = findMilestone(project, milestoneId);

  milestone.deleteOne();
  pushActivity(project, "milestone_deleted", user._id, { milestoneId });
  recomputeProgress(project);
  await project.save();

  return populateProject(projectId);
};

export const updateMilestoneProgress = async (projectId, milestoneId, user, progress) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, user);
  const milestone = findMilestone(project, milestoneId);

  milestone.progress = progress;
  if (progress > 0 && milestone.status === MILESTONE_STATUS.PENDING) {
    milestone.status = MILESTONE_STATUS.IN_PROGRESS;
  }
  if (progress === 100) {
    milestone.status = MILESTONE_STATUS.COMPLETED;
    milestone.completedAt = new Date();
  }

  pushActivity(project, "milestone_progress_updated", user._id, { milestoneId, progress });
  recomputeProgress(project);
  await project.save();

  return populateProject(projectId);
};

export const completeMilestone = async (projectId, milestoneId, user) => {
  const project = await findActiveProject(projectId);
  assertCanManageProject(project, user);
  const milestone = findMilestone(project, milestoneId);

  milestone.status = MILESTONE_STATUS.COMPLETED;
  milestone.progress = 100;
  milestone.completedAt = new Date();

  pushActivity(project, "milestone_completed", user._id, { milestoneId, title: milestone.title });
  recomputeProgress(project);
  await project.save();

  const notifyTargets = new Set(milestone.assignedTo.map(String));
  if (project.projectManager) notifyTargets.add(String(project.projectManager));
  notifyTargets.delete(String(user._id));

  await notificationService.notifyMany([...notifyTargets], {
    type: NOTIFICATION_TYPE.MILESTONE_COMPLETED,
    title: "Milestone completed",
    message: `Milestone "${milestone.title}" on project "${project.name}" has been marked complete`,
    project: project._id,
  });

  return populateProject(projectId);
};

// ------------------ Read operations ------------------

export const getProjectById = async (projectId, user) => {
  const project = await populateProject(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  assertCanAccessProject(project, user);
  return project;
};

/**
 * Paginated, searchable, sortable, filterable project listing.
 * `filters.team` / `filters.projectManager` are force-set by the controller
 * for non-admin roles so members only ever see their own projects.
 */
export const listProjects = async (filters = {}, options = {}) => {
  const { status, search, projectManager, team, deadlineBefore, deadlineAfter, memberScope } = filters;
  const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = options;

  const query = { isDeleted: false };
  if (status) query.status = status;
  if (projectManager) query.projectManager = projectManager;
  if (team) query.team = team;

  // memberScope is set by the controller for non-admin users: match projects
  // where the user is either the project manager or a team member.
  if (memberScope) {
    query.$or = [{ projectManager: memberScope }, { team: memberScope }];
  }

  if (deadlineBefore || deadlineAfter) {
    query.deadline = {};
    if (deadlineAfter) query.deadline.$gte = new Date(deadlineAfter);
    if (deadlineBefore) query.deadline.$lte = new Date(deadlineBefore);
  }

  if (search) {
    const searchClause = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "client.name": { $regex: search, $options: "i" } },
        { "client.company": { $regex: search, $options: "i" } },
      ],
    };
    // Combine with memberScope's $or via $and so both constraints apply.
    if (query.$or) {
      query.$and = [{ $or: query.$or }, searchClause];
      delete query.$or;
    } else {
      Object.assign(query, searchClause);
    }
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate("projectManager", "name email department designation profilePicture")
      .populate("team", "name email department designation profilePicture")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Project.countDocuments(query),
  ]);

  return {
    projects,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Status-count breakdown across all active projects, zero-filled so the
 * dashboard doesn't need to special-case missing statuses.
 */
export const getStatusCounts = async (scope = {}) => {
  const match = { isDeleted: false, ...scope };
  const results = await Project.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const counts = Object.values(PROJECT_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  results.forEach((r) => {
    counts[r._id] = r.count;
  });

  return counts;
};
