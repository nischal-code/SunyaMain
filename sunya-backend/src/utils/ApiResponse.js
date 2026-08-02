/**
 * Standardized success response shape:
 * { success, message, data }
 */
class ApiResponse {
  constructor(statusCode, message = "Success", data = null) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export const sendResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
};

export { ApiResponse };
