import { useMemo } from "react";
import useAuth from "./useAuth";

/**
 * usePermissions
 *
 * Role-based access helpers built on top of AuthContext's `user`.
 *
 * The backend has no role hierarchy — every restricted route uses an
 * explicit allow-list via authorizeRoles(...roles) (see
 * role.middleware.js), over four flat roles: super_admin, admin,
 * manager, employee. This hook mirrors that exactly rather than
 * inventing a rank system the API doesn't have, so `can(...)` checks
 * stay in sync with what the backend actually enforces.
 *
 * Usage:
 *   const { hasRole, hasAnyRole, isAdminOrAbove, can } = usePermissions();
 *
 *   if (hasAnyRole("super_admin", "admin")) { ... }
 *
 *   <Button disabled={!can("users:changeRole")}>Change role</Button>
 */

export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
});

// Mirrors the authorizeRoles(...) whitelists used across the backend's
// route definitions. Keep this in sync with the API if routes change.
const PERMISSIONS = Object.freeze({
  "users:view": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
  "users:manage": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "users:changeRole": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "settings:manage": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "projects:manage": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
  "reports:view": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
});

export const usePermissions = () => {
  const { user } = useAuth();
  const role = user?.role ?? null;

  return useMemo(() => {
    const hasRole = (targetRole) => role === targetRole;

    const hasAnyRole = (...roles) => roles.flat().includes(role);

    const can = (permissionKey) => {
      const allowedRoles = PERMISSIONS[permissionKey];
      if (!allowedRoles) return false;
      return allowedRoles.includes(role);
    };

    return {
      role,
      ROLES,
      hasRole,
      hasAnyRole,
      can,
      isSuperAdmin: role === ROLES.SUPER_ADMIN,
      isAdmin: role === ROLES.ADMIN,
      isManager: role === ROLES.MANAGER,
      isEmployee: role === ROLES.EMPLOYEE,
      isAdminOrAbove: hasAnyRole(ROLES.SUPER_ADMIN, ROLES.ADMIN),
      isManagerOrAbove: hasAnyRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER),
    };
  }, [role]);
};

export default usePermissions;
