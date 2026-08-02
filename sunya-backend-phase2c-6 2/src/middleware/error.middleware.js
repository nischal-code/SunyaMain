import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

/**
 * Converts known error types (Mongoose, JWT, etc.) into ApiError,
 * then sends a consistent { success, message, data } response.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";

    // Mongoose duplicate key error
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0];
      message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : "Field"} already exists`;
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
    }

    // Mongoose invalid ObjectId
    if (error.name === "CastError") {
      statusCode = 400;
      message = `Invalid ${error.path}: ${error.value}`;
    }

    // JWT errors
    if (error.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token";
    }
    if (error.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token expired";
    }

    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}\n${error.stack}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.message}`);
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    data: null,
    ...(env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
