import { ApiError } from "../utils/ApiError.js";

/**
 * Validates req.body / req.query / req.params against a Zod schema.
 * Usage: router.post('/', validate(loginSchema), controller)
 */
export const validate = (schema) => (req, _res, next) => {
  console.log("Request Body:");
  console.log(req.body);

  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    console.log("Validation Errors:");
    console.log(result.error.issues);

    return next(
      new ApiError(
        422,
        "Validation failed",
        result.error.issues
      )
    );
  }

  req.body = result.data.body;
  req.query = result.data.query;
  req.params = result.data.params;

  next();
};