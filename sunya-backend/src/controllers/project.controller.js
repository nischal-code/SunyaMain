import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as projectService from "../services/project.service.js";
import { ROLES } from "../utils/constants.js";

const ADMIN_TIER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const isAdminTier = (role) => ADMIN_TIER_ROLES.includes(role);

// ------------------ Project CRUD ------------------

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user._id);
  return sendResponse(res, 201, "Project created successfully", { project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.projectId, req.body, req.user);
  return sendResponse(res, 200, "Project updated successfully", { project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.projectId, req.user);
  return sendResponse(res, 200, "Project deleted successfully", null);
});

// ------------------ Team & Project Manager ------------------

export const assignTeam = asyncHandler(async (req, res) => {
  const project = await projectService.assignTeam(req.params.projectId, req.body.team, req.user);
  return sendResponse(res, 200, "Team assigned successfully", { project });
});

export const assignProjectManager = asyncHandler(async (req, res) => {
  const project = await projectService.assignProjectManager(
    req.params.projectId,
    req.body.projectManager,
    req.user
  );
  return sendResponse(res, 200, "Project manager assigned successfully", { project });
});

// ------------------ Budget, Deadline, Status, Progress ------------------

export const setBudget = asyncHandler(async (req, res) => {
  const project = await projectService.setBudget(req.params.projectId, req.body, req.user);
  return sendResponse(res, 200, "Budget updated successfully", { project });
});

export const setDeadline = asyncHandler(async (req, res) => {
  const project = await projectService.setDeadline(req.params.projectId, req.body.deadline, req.user);
  return sendResponse(res, 200, "Deadline updated successfully", { project });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const project = await projectService.changeStatus(req.params.projectId, req.body.status, req.user);
  return sendResponse(res, 200, "Project status updated successfully", { project });
});

export const updateProgress = asyncHandler(async (req, res) => {
  const project = await projectService.updateProgress(req.params.projectId, req.user, req.body.progress);
  return sendResponse(res, 200, "Project progress updated successfully", { project });
});

// ------------------ Files & Deliverables ------------------

export const addFiles = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, "No files uploaded");
  const project = await projectService.addFiles(req.params.projectId, req.user, req.files);
  return sendResponse(res, 200, "Files uploaded successfully", { project });
});

export const addDeliverables = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, "No files uploaded");
  const project = await projectService.addDeliverables(req.params.projectId, req.user, req.files);
  return sendResponse(res, 200, "Deliverables uploaded successfully", { project });
});

// ------------------ Milestones ------------------

export const addMilestone = asyncHandler(async (req, res) => {
  const project = await projectService.addMilestone(req.params.projectId, req.user, req.body);
  return sendResponse(res, 201, "Milestone created successfully", { project });
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const project = await projectService.updateMilestone(
    req.params.projectId,
    req.params.milestoneId,
    req.body,
    req.user
  );
  return sendResponse(res, 200, "Milestone updated successfully", { project });
});

export const deleteMilestone = asyncHandler(async (req, res) => {
  const project = await projectService.deleteMilestone(req.params.projectId, req.params.milestoneId, req.user);
  return sendResponse(res, 200, "Milestone deleted successfully", { project });
});

export const updateMilestoneProgress = asyncHandler(async (req, res) => {
  const project = await projectService.updateMilestoneProgress(
    req.params.projectId,
    req.params.milestoneId,
    req.user,
    req.body.progress
  );
  return sendResponse(res, 200, "Milestone progress updated successfully", { project });
});

export const completeMilestone = asyncHandler(async (req, res) => {
  const project = await projectService.completeMilestone(req.params.projectId, req.params.milestoneId, req.user);
  return sendResponse(res, 200, "Milestone marked as complete", { project });
});

// ------------------ Read operations ------------------

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId, req.user);
  return sendResponse(res, 200, "Project fetched successfully", { project });
});

// Lists projects with pagination/search/sort/filter. Non-admins are always
// scoped to projects where they're the PM or a team member.
export const listProjects = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, ...filters } = req.query;

  if (!isAdminTier(req.user.role)) {
    filters.memberScope = String(req.user._id);
  }

  const result = await projectService.listProjects(filters, { page, limit, sortBy, sortOrder });
  return sendResponse(res, 200, "Projects fetched successfully", result);
});
