import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";
import { ACTIVITY_MODULE, ACTIVITY_ACTION } from "../utils/constants.js";
import { logActivity } from "../services/activityLog.service.js";

// Get own profile
export const getProfile = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, "Profile fetched successfully", { user: req.user.toSafeObject() });
});

// Update own profile fields
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "department", "designation", "joiningDate"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTION.PROFILE_UPDATED,
    module: ACTIVITY_MODULE.USER,
    resourceId: req.user._id,
    req,
  });

  return sendResponse(res, 200, "Profile updated successfully", { user: user.toSafeObject() });
});

// Upload/replace profile picture
export const updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const user = await User.findById(req.user._id);

  // Remove old picture from Cloudinary if it exists
  if (user.profilePicture?.publicId) {
    await cloudinary.uploader.destroy(user.profilePicture.publicId).catch(() => {});
  }

  user.profilePicture = {
    url: req.file.path,
    publicId: req.file.filename,
  };
  await user.save();

  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTION.PROFILE_PICTURE_UPDATED,
    module: ACTIVITY_MODULE.USER,
    resourceId: req.user._id,
    req,
  });

  return sendResponse(res, 200, "Profile picture updated successfully", {
    profilePicture: user.profilePicture,
  });
});

// ------------------ Admin/Manager operations ------------------

// List all users (with optional department/role filter)
export const listUsers = asyncHandler(async (req, res) => {
  const { department, role, isActive } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const users = await User.find(filter).sort({ createdAt: -1 });

  return sendResponse(res, 200, "Users fetched successfully", { users, count: users.length });
});

// Get a single user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, "User not found");

  return sendResponse(res, 200, "User fetched successfully", { user: user.toSafeObject() });
});

// Update a user's role (super_admin/admin only, enforced at route level)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.role = role;
  await user.save();

  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTION.USER_ROLE_UPDATED,
    module: ACTIVITY_MODULE.USER,
    resourceId: user._id,
    req,
  });

  return sendResponse(res, 200, "User role updated successfully", { user: user.toSafeObject() });
});

// Activate/deactivate a user account
export const toggleUserActiveStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.isActive = !user.isActive;
  await user.save();

  await logActivity({
    user: req.user._id,
    action: user.isActive ? ACTIVITY_ACTION.USER_ACTIVATED : ACTIVITY_ACTION.USER_DEACTIVATED,
    module: ACTIVITY_MODULE.USER,
    resourceId: user._id,
    req,
  });

  return sendResponse(res, 200, `User ${user.isActive ? "activated" : "deactivated"} successfully`, {
    user: user.toSafeObject(),
  });
});
