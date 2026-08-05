import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authApi from "../../api/auth.api";
import AuthCard from "./AuthCard";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 30;

const inputClass = (hasError) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-center text-lg font-semibold tracking-[0.5em] text-gray-900 placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
    hasError ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-primary-500"
  }`;

/**
 * OTPVerificationForm
 * POST /auth/verify-email — verifies the 6-digit OTP sent to the user's
 * email after registration. Also supports resending the code via
 * POST /auth/resend-otp, gated behind a client-side cooldown.
 *
 * Expects the email to arrive via router state (set by RegisterForm),
 * but falls back to an editable field if it isn't present.
 */
const OTPVerificationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = location.state?.email || "";

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(stateEmail ? RESEND_COOLDOWN_SECONDS : 0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: { email: stateEmail, otp: "" },
  });

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMessage("");
    try {
      const email = values.email.trim().toLowerCase();
      await authApi.verifyOTP({ email, otp: values.otp.trim() });
      navigate("/login", {
        replace: true,
        state: { verified: true },
      });
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Invalid or expired code. Please try again."
      );
    }
  };

  const handleResend = async () => {
    const email = getValues("email")?.trim().toLowerCase();
    if (!email || !EMAIL_PATTERN.test(email)) {
      setServerError("Enter a valid email address before requesting a new code");
      return;
    }

    setServerError("");
    setSuccessMessage("");
    setIsResending(true);
    try {
      await authApi.resendOTP({ email });
      setSuccessMessage("A new verification code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setServerError(error?.response?.data?.message || "Unable to resend the code right now.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your email address"
      footer={
        <span>
          Wrong email?{" "}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
            Go back
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
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            {...register("email", {
              required: "Email is required",
              pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
            })}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-700">
            Verification code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            aria-invalid={errors.otp ? "true" : "false"}
            className={inputClass(errors.otp)}
            {...register("otp", {
              required: "Enter the 6-digit code",
              pattern: { value: /^[0-9]{6}$/, message: "Code must be exactly 6 digits" },
            })}
          />
          {errors.otp && <p className="mt-1.5 text-xs text-red-600">{errors.otp.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Verifying…" : "Verify email"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResending
            ? "Resending…"
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend code"}
        </button>
      </form>
    </AuthCard>
  );
};

export default OTPVerificationForm;
