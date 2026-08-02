import { useState } from "react";
import { useForm } from "react-hook-form";
import authApi from "../../api/auth.api";

const inputClass = (hasError) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
    hasError ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-primary-500"
  }`;

/**
 * ChangePasswordForm
 * POST /auth/change-password — for already-authenticated users updating
 * their password from a settings/profile screen. Unlike the other auth
 * forms this is meant to be embedded inline (e.g. inside
 * ChangePasswordPage / a settings card) rather than shown via AuthCard.
 */
const ChangePasswordForm = () => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMessage("");
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccessMessage("Your password has been updated.");
      reset();
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to update your password. Please try again."
      );
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">Change password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update the password used to sign in to your account.
        </p>
      </div>

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
          <label
            htmlFor="currentPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your current password"
            aria-invalid={errors.currentPassword ? "true" : "false"}
            className={inputClass(errors.currentPassword)}
            {...register("currentPassword", { required: "Current password is required" })}
          />
          {errors.currentPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
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
                different: (value) =>
                  value !== watch("currentPassword") ||
                  "New password must be different from the current password",
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
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
