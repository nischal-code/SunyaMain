import { Session } from "../models/Session.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { hashToken } from "../services/token.service.js";

// List all active sessions/devices for the logged-in user
export const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    user: req.user._id,
    isValid: true,
    expiresAt: { $gt: new Date() },
  })
    .select("-refreshTokenHash")
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, "Active sessions fetched", { sessions });
});

// Revoke a specific session (e.g. "log out this device")
export const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findOne({ _id: sessionId, user: req.user._id });
  if (!session) throw new ApiError(404, "Session not found");

  session.isValid = false;
  await session.save();

  return sendResponse(res, 200, "Session revoked successfully");
});

// Revoke all sessions except the current one
export const revokeAllOtherSessions = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies?.refreshToken;
  const currentHash = currentRefreshToken ? hashToken(currentRefreshToken) : null;

  await Session.updateMany(
    {
      user: req.user._id,
      ...(currentHash && { refreshTokenHash: { $ne: currentHash } }),
    },
    { isValid: false }
  );

  return sendResponse(res, 200, "All other sessions revoked successfully");
});
