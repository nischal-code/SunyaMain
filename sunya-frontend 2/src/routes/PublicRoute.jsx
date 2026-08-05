import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * PublicRoute
 * For routes that should only be reachable when logged OUT (login,
 * register, forgot-password, etc). If the user is already
 * authenticated, redirect them straight to the dashboard.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <div className="route-loading">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
};

export default PublicRoute;
