import { useContext } from "react";
import AuthContext from "../context/AuthContext";

/**
 * useAuth
 * Convenience hook for accessing the auth state/actions exposed by AuthContext.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }

  return context;
};

export default useAuth;
