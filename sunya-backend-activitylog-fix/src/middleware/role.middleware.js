import { ApiError } from "../utils/ApiError.js";

/**
 * Usage: router.get('/', verifyJWT, authorizeRoles('admin', 'super_admin'), handler)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden: you do not have permission to perform this action");
    }

    next();
  };
};
