import axiosClient from "./axiosClient";

/**
 * User API
 * Maps to /api/v1/users/* (user.routes.js). All routes require an
 * authenticated request; the admin/manager section below is additionally
 * restricted server-side (see role notes on each function).
 *
 * Note: there is no dedicated "create user" endpoint — new accounts are
 * created via POST /auth/register (see auth.api.js). This module only
 * covers what's actually mounted under /users.
 */

/* ------------------------------------------------------------------ */
/* Self-service                                                        */
/* ------------------------------------------------------------------ */

// GET /users/me
export const getMyProfile = () => axiosClient.get("/users/me");

// PATCH /users/me
// Allowed fields on the backend: name, phone, department, designation, joiningDate
export const updateProfile = ({ name, phone, department, designation, joiningDate }) =>
  axiosClient.patch("/users/me", { name, phone, department, designation, joiningDate });

// PATCH /users/me/profile-picture (multipart/form-data)
// `file` must be an image File/Blob; sent under the "profilePicture" field
// the backend's multer middleware expects.
export const updateProfilePicture = (file) => {
  const formData = new FormData();
  formData.append("profilePicture", file);
  return axiosClient.patch("/users/me/profile-picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* ------------------------------------------------------------------ */
/* Admin / Manager user management                                     */
/* ------------------------------------------------------------------ */

// GET /users
// Restricted to super_admin/admin/manager. params: { department, role, isActive }
export const listUsers = ({ department, role, isActive } = {}) =>
  axiosClient.get("/users", { params: { department, role, isActive } });

// GET /users/:userId
// Restricted to super_admin/admin/manager.
export const getUserById = (userId) => axiosClient.get(`/users/${userId}`);

// PATCH /users/:userId/role
// Restricted to super_admin/admin.
export const updateUserRole = (userId, role) =>
  axiosClient.patch(`/users/${userId}/role`, { role });

// PATCH /users/:userId/toggle-active
// Restricted to super_admin/admin. Flips isActive server-side — no body needed.
export const toggleUserActiveStatus = (userId) =>
  axiosClient.patch(`/users/${userId}/toggle-active`);

export default {
  getMyProfile,
  updateProfile,
  updateProfilePicture,
  listUsers,
  getUserById,
  updateUserRole,
  toggleUserActiveStatus,
};
