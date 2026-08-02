import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/auth.api";
import AuthCard from "./AuthCard";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ForgotPasswordForm
 * POST /auth/forgot-password — sends a password-reset OTP to the given
 * email. On success we forward the user to ResetPasswordForm (via the
 * /reset-password page) with the email pre-filled in route state.
 */
const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMessage("");
    try {
      const email = values.email.trim().toLowerCase();
      await authApi.forgotPassword({ email });
      setSuccessMessage("A reset code has been sent to your email.");
      setTimeout(() => {
        navigate("/reset-password", { state: { email }, replace: true });
      }, 1200);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to send a reset code. Please try again."
      );
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset code"
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
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
              errors.email
                ? "border-red-400 focus:border-red-400"
                : "border-gray-300 focus:border-primary-500"
            }`}
            {...register("email", {
              required: "Email is required",
              pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
            })}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || Boolean(successMessage)}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : "Send reset code"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPasswordForm;
