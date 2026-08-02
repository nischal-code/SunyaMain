import { ROLES, ROLE_LABELS, MANAGE_ROLES, ADMIN_ROLES } from "./constants";

/**
 * roleHelpers.js
 * Small, stateless helpers around the backend's flat role enum. For
 * component-level access checks tied to the current user, prefer the
 * usePermissions() hook — these are the underlying, hook-free primitives
 * it (and anything outside React, e.g. a plain util) can reuse.
 */

export const getRoleLabel = (role) => ROLE_LABELS[role] || role || "—";

export const isManageRole = (role) => MANAGE_ROLES.includes(role);

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const isSuperAdmin = (role) => role === ROLES.SUPER_ADMIN;

/** Sorts roles from most to least privileged, for consistent dropdown/table ordering. */
const ROLE_RANK = {
  [ROLES.SUPER_ADMIN]: 0,
  [ROLES.ADMIN]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.EMPLOYEE]: 3,
};

export const compareRoles = (a, b) => (ROLE_RANK[a] ?? 99) - (ROLE_RANK[b] ?? 99);

export const sortByRole = (list, getRole = (item) => item.role) =>
  [...list].sort((a, b) => compareRoles(getRole(a), getRole(b)));

export default {
  getRoleLabel,
  isManageRole,
  isAdminRole,
  isSuperAdmin,
  compareRoles,
  sortByRole,
};
