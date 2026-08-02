import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authApi from "../../api/auth.api";
import AuthCard from "./AuthCard";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (hasError) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
    hasError ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-primary-500"
  }`;

/**
 * ResetPasswordForm
 * POST /auth/reset-password — completes the reset using the OTP sent by
 * ForgotPasswordForm plus a new password.
 *
 * Expects the email via router state (set by ForgotPasswordForm), but
 * falls back to an editable field if the user landed here directly.
 */
const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = location.state?.email || "";

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: { email: stateEmail, otp: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMessage("");
    try {
      await authApi.resetPassword({
        email: values.email.trim().toLowerCase(),
        otp: values.otp.trim(),
        newPassword: values.newPassword,
      });
      setSuccessMessage("Your password has been reset successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to reset your password. Please try again."
      );
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the code we sent you and choose a new password"
      footer={
        <span>
          Remembered your password?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {serverError}
          </div>
        )}
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? "true" : "false"}
            className={inputClass(errors.email)}
            {...register("email", {
              required: "Email is required",
              pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
            })}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-700">
            Reset code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter the 6-digit code"
            aria-invalid={errors.otp ? "true" : "false"}
            className={inputClass(errors.otp)}
            {...register("otp", {
              required: "Enter the 6-digit code",
              pattern: { value: /^[0-9]{6}$/, message: "Code must be exactly 6 digits" },
            })}
          />
          {errors.otp && <p className="mt-1.5 text-xs text-red-600">{errors.otp.message}</p>}
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Create a new password"
            aria-invalid={errors.newPassword ? "true" : "false"}
            className={inputClass(errors.newPassword)}
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters long" },
              validate: {
                uppercase: (value) =>
                  /[A-Z]/.test(value) || "Password must contain at least one uppercase letter",
                lowercase: (value) =>
                  /[a-z]/.test(value) || "Password must contain at least one lowercase letter",
                number: (value) =>
                  /[0-9]/.test(value) || "Password must contain at least one number",
              },
            })}
          />
          {errors.newPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.newPassword.message}</p>
          )}
          {!errors.newPassword && (
            <p className="mt-1.5 text-xs text-gray-400">
              At least 8 characters, with one uppercase letter, one lowercase letter and one number.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            className={inputClass(errors.confirmPassword)}
            {...register("confirmPassword", {
              required: "Please confirm your new password",
              validate: (value) => value === newPassword || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || Boolean(successMessage)}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordForm;
