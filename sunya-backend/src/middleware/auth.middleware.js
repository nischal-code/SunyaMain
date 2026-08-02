import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../services/token.service.js";
import { User } from "../models/User.model.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: no access token provided");
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    throw new ApiError(401, "Unauthorized: invalid or expired access token");
  }

  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Unauthorized: user not found or inactive");
  }

  req.user = user;
  next();
});
