/**
 * constants.js
 * App-wide constant values that mirror fixed enums/rules on the Sunya
 * backend (Phase 2C-6). Keep these in sync with the backend's models/
 * validators if the API's enums ever change.
 */

// Mirrors the four flat roles enforced by role.middleware.js (authorizeRoles).
export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.MANAGER]: "Manager",
  [ROLES.EMPLOYEE]: "Employee",
});

export const MANAGE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];
export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export const TASK_STATUSES = Object.freeze({
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
});

export const TASK_STATUS_LABELS = Object.freeze({
  [TASK_STATUSES.TODO]: "To Do",
  [TASK_STATUSES.IN_PROGRESS]: "In Progress",
  [TASK_STATUSES.COMPLETED]: "Completed",
});

export const TASK_PRIORITIES = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
});

export const PROJECT_STATUSES = Object.freeze({
  PLANNING: "planning",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

export const ATTENDANCE_STATUSES = Object.freeze({
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  HALF_DAY: "half_day",
  ON_LEAVE: "on_leave",
});

// Storage keys used across the app (see also api/axiosClient.js, which
// owns the access-token key itself).
export const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: "sunya_access_token",
  THEME: "sunya_theme",
});

export const DEFAULT_PAGE_SIZE = 20;

export const TOAST_DURATION_MS = 4500;
