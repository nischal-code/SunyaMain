import { User } from "../models/User.model.js";
import { Session } from "../models/Session.model.js";
import { OTP } from "../models/OTP.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendResponse } from "../utils/ApiResponse.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../services/email.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../services/token.service.js";
import { OTP_PURPOSE, ACTIVITY_MODULE, ACTIVITY_ACTION } from "../utils/constants.js";
import { env } from "../config/env.js";
import { logActivity } from "../services/activityLog.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "strict",
};

const createAndSendOTP = async (userId, email, purpose) => {
  const otp = generateOTP(6);
  const codeHash = hashToken(otp);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate any previous unconsumed OTPs of the same purpose
  await OTP.deleteMany({ user: userId, purpose, consumedAt: null });

  await OTP.create({ user: userId, codeHash, purpose, expiresAt });
  await sendOTPEmail(email, otp, purpose);
};

const createSession = async (user, req) => {
  const refreshToken = generateRefreshToken(user);
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRY_MS);

  await Session.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || null,
    expiresAt,
  });

  return refreshToken;
};

// ---------------------- REGISTER ----------------------
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password, phone });

  await createAndSendOTP(user._id, user.email, OTP_PURPOSE.EMAIL_VERIFICATION);

  await logActivity({
    user: user._id,
    action: ACTIVITY_ACTION.REGISTER,
    module: ACTIVITY_MODULE.AUTH,
    resourceId: user._id,
    req,
  });

  return sendResponse(res, 201, "Registration successful. Please verify your email with the OTP sent.", {
    userId: user._id,
    email: user.email,
  });
});

// ---------------------- VERIFY EMAIL ----------------------
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.isEmailVerified) {
    return sendResponse(res, 200, "Email already verified");
  }

  const otpRecord = await OTP.findOne({
    user: user._id,
    purpose: OTP_PURPOSE.EMAIL_VERIFICATION,
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (otpRecord.attempts >= 5) {
    throw new ApiError(429, "Too many incorrect attempts. Please request a new OTP.");
  }

  if (hashToken(otp) !== otpRecord.codeHash) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, "Invalid OTP");
  }

  otpRecord.consumedAt = new Date();
  await otpRecord.save();

  user.isEmailVerified = true;
  await user.save();

  await logActivity({
    user: user._id,
    action: ACTIVITY_ACTION.EMAIL_VERIFIED,
    module: ACTIVITY_MODULE.AUTH,
    resourceId: user._id,
    req,
  });

  return sendResponse(res, 200, "Email verified successfully");
});

// ---------------------- RESEND OTP ----------------------
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.isEmailVerified) {
    return sendResponse(res, 200, "Email already verified");
  }

  await createAndSendOTP(user._id, user.email, OTP_PURPOSE.EMAIL_VERIFICATION);

  return sendResponse(res, 200, "OTP resent successfully");
});

// ---------------------- LOGIN ----------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  if (!user.isActive) throw new ApiError(403, "Your account has been deactivated");

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = await createSession(user, req);

  res
    .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: env.REFRESH_TOKEN_EXPIRY_MS });

  await logActivity({
    user: user._id,
    action: ACTIVITY_ACTION.LOGIN,
    module: ACTIVITY_MODULE.AUTH,
    resourceId: user._id,
    req,
  });

  return sendResponse(res, 200, "Login successful", {
    user: user.toSafeObject(),
    accessToken,
  });
});

// ---------------------- REFRESH TOKEN ----------------------
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const tokenHash = hashToken(incomingRefreshToken);
  const session = await Session.findOne({
    user: decoded.userId,
    refreshTokenHash: tokenHash,
    isValid: true,
  });

  if (!session || session.expiresAt < new Date()) {
    throw new ApiError(401, "Session expired or invalid. Please log in again.");
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    throw new ApiError(401, "User not found or inactive");
  }

  // Rotate refresh token: invalidate old session, issue a new one
  session.isValid = false;
  await session.save();

  const newRefreshToken = await createSession(user, req);
  const newAccessToken = generateAccessToken(user);

  res
    .cookie("accessToken", newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", newRefreshToken, { ...cookieOptions, maxAge: env.REFRESH_TOKEN_EXPIRY_MS });

  return sendResponse(res, 200, "Access token refreshed", { accessToken: newAccessToken });
});

// ---------------------- LOGOUT ----------------------
export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (incomingRefreshToken) {
    const tokenHash = hashToken(incomingRefreshToken);
    const session = await Session.findOneAndUpdate(
      { refreshTokenHash: tokenHash },
      { isValid: false }
    );

    if (session) {
      await logActivity({
        user: session.user,
        action: ACTIVITY_ACTION.LOGOUT,
        module: ACTIVITY_MODULE.AUTH,
        resourceId: session.user,
        req,
      });
    }
  }

  res.clearCookie("accessToken", cookieOptions).clearCookie("refreshToken", cookieOptions);

  return sendResponse(res, 200, "Logged out successfully");
});

// ---------------------- FORGOT PASSWORD ----------------------
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return a generic success message to avoid leaking which emails are registered
  if (user) {
    await createAndSendOTP(user._id, user.email, OTP_PURPOSE.PASSWORD_RESET);

    await logActivity({
      user: user._id,
      action: ACTIVITY_ACTION.PASSWORD_RESET_REQUESTED,
      module: ACTIVITY_MODULE.AUTH,
      resourceId: user._id,
      req,
    });
  }

  return sendResponse(res, 200, "If an account with that email exists, an OTP has been sent");
});

// ---------------------- RESET PASSWORD ----------------------
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otpRecord = await OTP.findOne({
    user: user._id,
    purpose: OTP_PURPOSE.PASSWORD_RESET,
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (otpRecord.attempts >= 5) {
    throw new ApiError(429, "Too many incorrect attempts. Please request a new OTP.");
  }

  if (hashToken(otp) !== otpRecord.codeHash) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, "Invalid OTP");
  }

  otpRecord.consumedAt = new Date();
  await otpRecord.save();

  user.password = newPassword;
  await user.save();

  // Invalidate all existing sessions for security
  await Session.updateMany({ user: user._id }, { isValid: false });

  await logActivity({
    user: user._id,
    action: ACTIVITY_ACTION.PASSWORD_RESET,
    module: ACTIVITY_MODULE.AUTH,
    resourceId: user._id,
    req,
  });

  return sendResponse(res, 200, "Password reset successfully. Please log in again.");
});

// ---------------------- CHANGE PASSWORD ----------------------
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  user.password = newPassword;
  await user.save();

  // Invalidate all other sessions for security
  await Session.updateMany({ user: user._id }, { isValid: false });

  await logActivity({
    user: user._id,
    action: ACTIVITY_ACTION.PASSWORD_CHANGED,
    module: ACTIVITY_MODULE.AUTH,
    resourceId: user._id,
    req,
  });

  return sendResponse(res, 200, "Password changed successfully. Please log in again.");
});

// ---------------------- CURRENT USER ----------------------
export const getCurrentUser = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, "Current user fetched", { user: req.user.toSafeObject() });
});
