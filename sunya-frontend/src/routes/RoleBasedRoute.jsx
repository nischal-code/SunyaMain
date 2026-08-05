import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * RoleBasedRoute
 * Guards a route behind a whitelist of roles. Assumes the caller has
 * already wrapped this in (or nested this under) a <ProtectedRoute />,
 * so `user` is expected to be present.
 *
 * Backend roles (see ROLES in the Sunya API): super_admin, admin, manager, employee.
 *
 * Usage:
 *   <Route element={<RoleBasedRoute allowedRoles={["super_admin", "admin"]} />}>
 *     <Route path="/settings" element={<OfficeSettingsPage />} />
 *   </Route>
 */
const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <div className="route-loading">Loading...</div>;
  }

  const hasAccess = user && allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
};

export default RoleBasedRoute;
