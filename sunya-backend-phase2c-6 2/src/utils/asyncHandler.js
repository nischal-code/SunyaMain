/**
 * Wraps an async route/controller function so any rejected promise
 * is forwarded to Express's error-handling middleware via next().
 */
export const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
};
