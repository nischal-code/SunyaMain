export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
});

export const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
];

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: "present",
  LATE: "late",
  HALF_DAY: "half_day",
  ABSENT: "absent",
  LEAVE: "leave",
  REMOTE: "remote",
});

export const OTP_PURPOSE = Object.freeze({
  EMAIL_VERIFICATION: "email_verification",
  PASSWORD_RESET: "password_reset",
});

export const MIN_CLOCK_OUT_HOURS = 3; // Minimum hours before an employee can clock out

export const TASK_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

export const TASK_PRIORITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});

export const NOTIFICATION_TYPE = Object.freeze({
  TASK_ASSIGNED: "task_assigned",
  TASK_REASSIGNED: "task_reassigned",
  TASK_UPDATED: "task_updated",
  TASK_STATUS_CHANGED: "task_status_changed",
  TASK_COMMENT_ADDED: "task_comment_added",
  TASK_DUE_SOON: "task_due_soon",
  PROJECT_ASSIGNED: "project_assigned",
  PROJECT_MANAGER_ASSIGNED: "project_manager_assigned",
  PROJECT_UPDATED: "project_updated",
  PROJECT_STATUS_CHANGED: "project_status_changed",
  MILESTONE_ASSIGNED: "milestone_assigned",
  MILESTONE_COMPLETED: "milestone_completed",
  PROJECT_DEADLINE_SOON: "project_deadline_soon",
});

export const UPCOMING_DEADLINE_WINDOW_DAYS = 7; // How far ahead "upcoming deadlines" looks

export const PROJECT_STATUS = Object.freeze({
  PLANNING: "planning",
  DESIGN: "design",
  DEVELOPMENT: "development",
  TESTING: "testing",
  PRODUCTION: "production",
  COMPLETED: "completed",
});

export const MILESTONE_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
});
// Projects considered "running" (actively in flight) for the Employee
// Dashboard's "Running Projects" card. Excludes PLANNING (not started yet)
// and COMPLETED (finished).
export const RUNNING_PROJECT_STATUSES = [
  PROJECT_STATUS.DESIGN,
  PROJECT_STATUS.DEVELOPMENT,
  PROJECT_STATUS.TESTING,
  PROJECT_STATUS.PRODUCTION,
];

// ------------------ Activity Log (audit trail) ------------------

export const ACTIVITY_MODULE = Object.freeze({
  AUTH: "auth",
  TASK: "task",
  PROJECT: "project",
  USER: "user",
  ATTENDANCE: "attendance",
  SETTINGS: "settings",
});

export const ACTIVITY_ACTION = Object.freeze({
  // auth
  REGISTER: "REGISTER",
  EMAIL_VERIFIED: "EMAIL_VERIFIED",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET: "PASSWORD_RESET",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  // task
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DELETED: "TASK_DELETED",
  TASK_REASSIGNED: "TASK_REASSIGNED",
  TASK_STATUS_CHANGED: "TASK_STATUS_CHANGED",
  TASK_STARTED: "TASK_STARTED",
  TASK_PROGRESS_UPDATED: "TASK_PROGRESS_UPDATED",
  TASK_COMPLETED: "TASK_COMPLETED",
  TASK_COMMENT_ADDED: "TASK_COMMENT_ADDED",
  TASK_ATTACHMENTS_ADDED: "TASK_ATTACHMENTS_ADDED",
  TASK_DELIVERABLES_ADDED: "TASK_DELIVERABLES_ADDED",
  // project
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_UPDATED: "PROJECT_UPDATED",
  PROJECT_DELETED: "PROJECT_DELETED",
  PROJECT_TEAM_ASSIGNED: "PROJECT_TEAM_ASSIGNED",
  PROJECT_MANAGER_ASSIGNED: "PROJECT_MANAGER_ASSIGNED",
  PROJECT_BUDGET_UPDATED: "PROJECT_BUDGET_UPDATED",
  PROJECT_DEADLINE_UPDATED: "PROJECT_DEADLINE_UPDATED",
  PROJECT_STATUS_CHANGED: "PROJECT_STATUS_CHANGED",
  PROJECT_PROGRESS_UPDATED: "PROJECT_PROGRESS_UPDATED",
  PROJECT_FILES_ADDED: "PROJECT_FILES_ADDED",
  PROJECT_DELIVERABLES_ADDED: "PROJECT_DELIVERABLES_ADDED",
  MILESTONE_ADDED: "MILESTONE_ADDED",
  MILESTONE_UPDATED: "MILESTONE_UPDATED",
  MILESTONE_DELETED: "MILESTONE_DELETED",
  MILESTONE_PROGRESS_UPDATED: "MILESTONE_PROGRESS_UPDATED",
  MILESTONE_COMPLETED: "MILESTONE_COMPLETED",
  // user
  PROFILE_UPDATED: "PROFILE_UPDATED",
  PROFILE_PICTURE_UPDATED: "PROFILE_PICTURE_UPDATED",
  USER_ROLE_UPDATED: "USER_ROLE_UPDATED",
  USER_ACTIVATED: "USER_ACTIVATED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
  // attendance
  CLOCK_IN: "CLOCK_IN",
  CLOCK_OUT: "CLOCK_OUT",
  ATTENDANCE_CREATED: "ATTENDANCE_CREATED",
  ATTENDANCE_UPDATED: "ATTENDANCE_UPDATED",
  ATTENDANCE_DELETED: "ATTENDANCE_DELETED",
  // settings
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
});