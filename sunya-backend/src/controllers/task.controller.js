import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as taskService from "../services/task.service.js";
import { ROLES } from "../utils/constants.js";

const ADMIN_TIER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];
const isAdminTier = (role) => ADMIN_TIER_ROLES.includes(role);

// ------------------ Admin/Manager management ------------------

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user._id);
  return sendResponse(res, 201, "Task created successfully", { task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.body, req.user._id);
  return sendResponse(res, 200, "Task updated successfully", { task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.taskId, req.user._id);
  return sendResponse(res, 200, "Task deleted successfully", null);
});

export const reassignTask = asyncHandler(async (req, res) => {
  const task = await taskService.reassignTask(req.params.taskId, req.body.assignedTo, req.user._id);
  return sendResponse(res, 200, "Task reassigned successfully", { task });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const task = await taskService.changeStatus(req.params.taskId, req.body.status, req.user._id);
  return sendResponse(res, 200, "Task status updated successfully", { task });
});

export const addAttachments = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, "No files uploaded");
  const task = await taskService.addAttachments(req.params.taskId, req.user, req.files);
  return sendResponse(res, 200, "Attachments uploaded successfully", { task });
});

// ------------------ Employee self-service ------------------

export const startTask = asyncHandler(async (req, res) => {
  const task = await taskService.startTask(req.params.taskId, req.user);
  return sendResponse(res, 200, "Task started successfully", { task });
});

export const updateProgress = asyncHandler(async (req, res) => {
  const task = await taskService.updateProgress(req.params.taskId, req.user, req.body.progress);
  return sendResponse(res, 200, "Task progress updated successfully", { task });
});

export const addDeliverables = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, "No files uploaded");
  const task = await taskService.addDeliverables(req.params.taskId, req.user, req.files);
  return sendResponse(res, 200, "Deliverables uploaded successfully", { task });
});

export const markComplete = asyncHandler(async (req, res) => {
  const task = await taskService.markComplete(req.params.taskId, req.user);
  return sendResponse(res, 200, "Task marked as complete", { task });
});

// ------------------ Shared ------------------

export const addComment = asyncHandler(async (req, res) => {
  const task = await taskService.addComment(req.params.taskId, req.user, req.body.text);
  return sendResponse(res, 200, "Comment added successfully", { task });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, req.user);
  return sendResponse(res, 200, "Task fetched successfully", { task });
});

// Lists tasks with pagination/search/sort/filter. Employees are always
// scoped to their own assigned tasks regardless of query params.
export const listTasks = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, ...filters } = req.query;

  if (!isAdminTier(req.user.role)) {
    filters.assignedTo = String(req.user._id);
  }

  const result = await taskService.listTasks(filters, { page, limit, sortBy, sortOrder });
  return sendResponse(res, 200, "Tasks fetched successfully", result);
});
