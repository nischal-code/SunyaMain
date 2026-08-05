import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosClient, {
  clearAccessToken,
  setAccessToken,
  setOnAuthExpired,
} from "../api/axiosClient";

export const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * Owns the authenticated user + access token state for the whole app.
 *
 * Flow:
 *  - On mount, silently try to restore a session via the httpOnly
 *    refreshToken cookie (POST /auth/refresh-token), then fetch the
 *    current user (GET /auth/me). If either fails, the user is simply
 *    treated as logged out — no error is surfaced.
 *  - login()/logout() call the backend and update local state.
 *  - axiosClient is notified (via setOnAuthExpired) so that a refresh
 *    failure triggered by a 401 anywhere in the app also logs the user
 *    out here.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const hasBootstrapped = useRef(false);

  const handleAuthExpired = useCallback(() => {
    setUser(null);
    clearAccessToken();
  }, []);

  useEffect(() => {
    setOnAuthExpired(handleAuthExpired);
  }, [handleAuthExpired]);

  // Attempt to restore a session on first load.
  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    const bootstrapSession = async () => {
      try {
        const refreshRes = await axiosClient.post("/auth/refresh-token");
        const accessToken = refreshRes?.data?.data?.accessToken;
        setAccessToken(accessToken);

        const meRes = await axiosClient.get("/auth/me");
        setUser(meRes?.data?.data?.user ?? null);
      } catch {
        setUser(null);
        clearAccessToken();
      } finally {
        setIsInitializing(false);
      }
    };

    bootstrapSession();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { data } = await axiosClient.post("/auth/login", { email, password });
      const { user: loggedInUser, accessToken } = data.data;

      setAccessToken(accessToken);
      setUser(loggedInUser);

      return loggedInUser;
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to log in";
      setAuthError(message);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch {
      // Even if the request fails, clear local state so the UI reflects
      // a logged-out session.
    } finally {
      setUser(null);
      clearAccessToken();
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const { data } = await axiosClient.get("/auth/me");
    setUser(data?.data?.user ?? null);
    return data?.data?.user ?? null;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      isAuthenticating,
      authError,
      login,
      logout,
      refreshCurrentUser,
    }),
    [user, isInitializing, isAuthenticating, authError, login, logout, refreshCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
