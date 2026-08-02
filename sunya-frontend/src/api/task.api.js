import axiosClient from "./axiosClient";

/**
 * Task API
 * Maps to /api/v1/tasks/* (task.routes.js). All routes require an
 * authenticated request. Listing/detail/comments are shared (employees
 * are always scoped server-side to tasks assigned to them); self-service
 * actions (start/progress/complete/deliverables) are for the assignee;
 * management actions (create/update/delete/reassign/status/attachments)
 * are restricted server-side to super_admin/admin/manager.
 */

/* ------------------------------------------------------------------ */
/* Listing / detail                                                    */
/* ------------------------------------------------------------------ */

// GET /tasks
// params: { status, priority, project, assignedTo, assignedBy, search,
//           dueBefore, dueAfter, page, limit, sortBy, sortOrder }
// Employees are always scoped to their own assigned tasks regardless of
// the assignedTo param; super_admin/admin/manager see everything.
export const listTasks = (params = {}) => axiosClient.get("/tasks", { params });

// GET /tasks/:taskId
export const getTaskById = (taskId) => axiosClient.get(`/tasks/${taskId}`);

/* ------------------------------------------------------------------ */
/* Admin / Manager management                                          */
/* ------------------------------------------------------------------ */

// POST /tasks
// Restricted to super_admin/admin/manager.
// body: { title, description, project, assignedTo: string[], priority, dueDate }
export const createTask = ({ title, description, project, assignedTo, priority, dueDate }) =>
  axiosClient.post("/tasks", { title, description, project, assignedTo, priority, dueDate });

// PATCH /tasks/:taskId
// Restricted to super_admin/admin/manager.
// body: { title, description, project, priority, dueDate }
export const updateTask = (taskId, payload = {}) =>
  axiosClient.patch(`/tasks/${taskId}`, payload);

// DELETE /tasks/:taskId
// Restricted to super_admin/admin/manager.
export const deleteTask = (taskId) => axiosClient.delete(`/tasks/${taskId}`);

// PATCH /tasks/:taskId/reassign
// Restricted to super_admin/admin/manager. body: { assignedTo: string[] }
export const reassignTask = (taskId, assignedTo) =>
  axiosClient.patch(`/tasks/${taskId}/reassign`, { assignedTo });

// PATCH /tasks/:taskId/status
// Restricted to super_admin/admin/manager.
// status: "pending" | "in_progress" | "review" | "completed" | "cancelled"
export const changeTaskStatus = (taskId, status) =>
  axiosClient.patch(`/tasks/${taskId}/status`, { status });

// POST /tasks/:taskId/attachments (multipart/form-data, up to 5 files)
// Restricted to super_admin/admin/manager.
export const addTaskAttachments = (taskId, files = []) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("attachments", file));
  return axiosClient.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* ------------------------------------------------------------------ */
/* Employee self-service                                               */
/* ------------------------------------------------------------------ */

// PATCH /tasks/:taskId/start
export const startTask = (taskId) => axiosClient.patch(`/tasks/${taskId}/start`);

// PATCH /tasks/:taskId/progress
// body: { progress: number (0-100) }
export const updateTaskProgress = (taskId, progress) =>
  axiosClient.patch(`/tasks/${taskId}/progress`, { progress });

// PATCH /tasks/:taskId/complete
export const markTaskComplete = (taskId) => axiosClient.patch(`/tasks/${taskId}/complete`);

// POST /tasks/:taskId/deliverables (multipart/form-data, up to 5 files)
export const addTaskDeliverables = (taskId, files = []) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("deliverables", file));
  return axiosClient.post(`/tasks/${taskId}/deliverables`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* ------------------------------------------------------------------ */
/* Shared                                                               */
/* ------------------------------------------------------------------ */

// POST /tasks/:taskId/comments
// body: { text }
export const addTaskComment = (taskId, text) =>
  axiosClient.post(`/tasks/${taskId}/comments`, { text });

export default {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  reassignTask,
  changeTaskStatus,
  addTaskAttachments,
  startTask,
  updateTaskProgress,
  markTaskComplete,
  addTaskDeliverables,
  addTaskComment,
};
