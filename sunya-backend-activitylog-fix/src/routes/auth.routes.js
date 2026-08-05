import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);
router.post("/resend-otp", authLimiter, validate(resendOTPSchema), authController.resendOTP);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/logout", verifyJWT, authController.logout);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.post(
  "/change-password",
  verifyJWT,
  validate(changePasswordSchema),
  authController.changePassword
);
router.get("/me", verifyJWT, authController.getCurrentUser);

export default router;
