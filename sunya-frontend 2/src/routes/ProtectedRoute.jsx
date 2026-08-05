import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * ProtectedRoute
 * Renders its children (or nested <Outlet />) only when the user is
 * authenticated. While the session is still being restored on first
 * load, it renders nothing (or a minimal fallback) rather than
 * flashing a redirect to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <div className="route-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
