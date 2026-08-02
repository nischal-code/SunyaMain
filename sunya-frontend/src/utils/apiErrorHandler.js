/**
 * apiErrorHandler.js
 * Normalizes errors from axiosClient calls (see api/axiosClient.js) into
 * a single, UI-friendly shape, since Sunya's backend error envelope is
 * consistently { success: false, message, errors? } (see
 * middleware/error.middleware.js) but network/timeout failures never
 * reach that code at all.
 */

/** Extracts a single human-readable message from any axios/API error. */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;

  // A validation error array from validate.middleware.js: [{ field, message }, ...]
  const fieldErrors = error?.response?.data?.errors;
  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors.map((entry) => entry.message || entry).join(" ");
  }

  const backendMessage = error?.response?.data?.message;
  if (backendMessage) return backendMessage;

  if (error?.code === "ERR_NETWORK") return "Network error — check your connection and try again.";
  if (error?.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (typeof error?.message === "string" && error.message) return error.message;

  return fallback;
};

/** Maps field-level validation errors to { [fieldName]: message } for form libraries. */
export const getFieldErrors = (error) => {
  const fieldErrors = error?.response?.data?.errors;
  if (!Array.isArray(fieldErrors)) return {};

  return fieldErrors.reduce((acc, entry) => {
    if (entry?.field) acc[entry.field] = entry.message || "Invalid value";
    return acc;
  }, {});
};

export const getStatusCode = (error) => error?.response?.status ?? null;

export const isUnauthorized = (error) => getStatusCode(error) === 401;
export const isForbidden = (error) => getStatusCode(error) === 403;
export const isNotFound = (error) => getStatusCode(error) === 404;

export default {
  getErrorMessage,
  getFieldErrors,
  getStatusCode,
  isUnauthorized,
  isForbidden,
  isNotFound,
};
