import axiosClient from "./axiosClient";

/**
 * Auth API
 * Maps 1:1 to the backend's /api/v1/auth/* routes (auth.routes.js).
 *
 * Notes:
 * - login/refreshToken also set httpOnly cookies server-side; the
 *   accessToken returned in the response body is what the caller
 *   (AuthContext) should hand to setAccessToken().
 * - logout/changePassword require an authenticated request; axiosClient
 *   already attaches the Authorization header automatically.
 */

// POST /auth/register
export const register = ({ name, email, password, phone }) =>
  axiosClient.post("/auth/register", { name, email, password, phone });

// POST /auth/verify-email
export const verifyOTP = ({ email, otp }) =>
  axiosClient.post("/auth/verify-email", { email, otp });

// POST /auth/resend-otp
export const resendOTP = ({ email }) => axiosClient.post("/auth/resend-otp", { email });

// POST /auth/login
export const login = ({ email, password }) =>
  axiosClient.post("/auth/login", { email, password });

// POST /auth/refresh-token
// Uses the httpOnly refreshToken cookie automatically (withCredentials: true);
// no body is required.
export const refreshToken = () => axiosClient.post("/auth/refresh-token");

// POST /auth/logout
export const logout = () => axiosClient.post("/auth/logout");

// POST /auth/forgot-password
export const forgotPassword = ({ email }) => axiosClient.post("/auth/forgot-password", { email });

// POST /auth/reset-password
export const resetPassword = ({ email, otp, newPassword }) =>
  axiosClient.post("/auth/reset-password", { email, otp, newPassword });

// POST /auth/change-password
export const changePassword = ({ currentPassword, newPassword }) =>
  axiosClient.post("/auth/change-password", { currentPassword, newPassword });

// GET /auth/me
export const getCurrentUser = () => axiosClient.get("/auth/me");

export default {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
};
