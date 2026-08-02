import axiosClient from "./axiosClient";

/**
 * Project API
 * Maps to /api/v1/projects/* (project.routes.js). All routes require an
 * authenticated request; creating, editing, deleting, and member
 * management are additionally restricted server-side (see role notes on
 * each function) to super_admin/admin/manager.
 */

/* ------------------------------------------------------------------ */
/* Listing / detail                                                    */
/* ------------------------------------------------------------------ */

// GET /projects
// params: { search, status, department, page, limit, sortBy, sortOrder }
// Employees see only projects they're a member of; super_admin/admin/manager see all.
export const listProjects = (params = {}) => axiosClient.get("/projects", { params });

// GET /projects/:projectId
export const getProjectById = (projectId) => axiosClient.get(`/projects/${projectId}`);

/* ------------------------------------------------------------------ */
/* Create / update / delete                                            */
/* ------------------------------------------------------------------ */

// POST /projects
// Restricted to super_admin/admin/manager.
// body: { name, description, department, priority, startDate, deadline, budget }
export const createProject = ({
  name,
  description,
  department,
  priority,
  startDate,
  deadline,
  budget,
}) =>
  axiosClient.post("/projects", {
    name,
    description,
    department,
    priority,
    startDate,
    deadline,
    budget,
  });

// PATCH /projects/:projectId
// Restricted to super_admin/admin/manager. Same editable fields as create.
export const updateProject = (projectId, payload = {}) =>
  axiosClient.patch(`/projects/${projectId}`, payload);

// PATCH /projects/:projectId/status
// Restricted to super_admin/admin/manager. status: "planning" | "in_progress"
// | "on_hold" | "completed" | "cancelled"
export const updateProjectStatus = (projectId, status) =>
  axiosClient.patch(`/projects/${projectId}/status`, { status });

// DELETE /projects/:projectId
// Restricted to super_admin/admin.
export const deleteProject = (projectId) => axiosClient.delete(`/projects/${projectId}`);

/* ------------------------------------------------------------------ */
/* Team                                                                 */
/* ------------------------------------------------------------------ */

// PATCH /projects/:projectId/team
// Restricted to super_admin/admin/manager. Replaces the *entire* team —
// there's no incremental add/remove endpoint, so callers must send the
// full desired member id array (existing members + additions - removals).
// body: { team: string[] }
export const setProjectTeam = (projectId, team) =>
  axiosClient.patch(`/projects/${projectId}/team`, { team });

// PATCH /projects/:projectId/manager
// Restricted to super_admin/admin. body: { projectManager: string | null }
export const setProjectManager = (projectId, projectManager) =>
  axiosClient.patch(`/projects/${projectId}/manager`, { projectManager });

export default {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  setProjectTeam,
  setProjectManager,
};