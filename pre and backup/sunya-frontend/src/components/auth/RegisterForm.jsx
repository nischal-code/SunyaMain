import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/auth.api";
import AuthCard from "./AuthCard";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/;

const inputClass = (hasError) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
    hasError ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-primary-500"
  }`;

/**
 * RegisterForm
 * POST /auth/register — on success the backend sends a verification OTP
 * to the provided email, so we route the user to OTPVerificationForm
 * (via the /verify-otp page) and hand the email along in route state.
 */
const RegisterForm = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const email = values.email.trim().toLowerCase();
      await authApi.register({
        name: values.name.trim(),
        email,
        password: values.password,
        phone: values.phone?.trim() || undefined,
      });
      navigate("/verify-otp", { state: { email }, replace: true });
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to create your account. Please try again."
      );
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Get started with Sunya in a few seconds"
      footer={
        <span>
          Already have an account?{" "}
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

        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            aria-invalid={errors.name ? "true" : "false"}
            className={inputClass(errors.name)}
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "Name must be at least 2 characters" },
              maxLength: { value: 100, message: "Name must be under 100 characters" },
            })}
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
        </div>

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
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
            Phone <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 234 567 8900"
            aria-invalid={errors.phone ? "true" : "false"}
            className={inputClass(errors.phone)}
            {...register("phone", {
              validate: (value) =>
                !value || PHONE_PATTERN.test(value) || "Enter a valid phone number",
            })}
          />
          {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            aria-invalid={errors.password ? "true" : "false"}
            className={inputClass(errors.password)}
            {...register("password", {
              required: "Password is required",
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
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          )}
          {!errors.password && (
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
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            className={inputClass(errors.confirmPassword)}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
};

export default RegisterForm;
