import { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import authApi from "../../api/auth.api";
import userApi from "../../api/user.api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

/**
 * UserCreateForm
 * There's no dedicated "admin creates user" endpoint on the backend — new
 * accounts always go through POST /auth/register (email/OTP verification
 * flow), which always creates the account as "employee". So this form:
 *   1. Calls authApi.register() to create the account.
 *   2. If a non-employee role was chosen (and the caller can assign roles),
 *      immediately follows up with userApi.updateUserRole().
 * The new user still has to verify their email with the OTP sent to them
 * before they can log in.
 *
 * Props:
 *  - canAssignRole: bool — show the role select; PATCH /users/:id/role is
 *                   restricted to super_admin/admin, so pass this only for
 *                   those roles. Default false (account is created as employee).
 *  - onSuccess:     fn({ userId, email, role }) — called after the account
 *                   (and optional role assignment) is created.
 */
const UserCreateForm = ({ canAssignRole = false, onSuccess }) => {
  const [serverError, setServerError] = useState("");
  const [roleWarning, setRoleWarning] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "employee",
    },
  });

  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    setRoleWarning("");

    try {
      const email = values.email.trim().toLowerCase();
      const { data } = await authApi.register({
        name: values.name.trim(),
        email,
        password: values.password,
        phone: values.phone?.trim() || undefined,
      });

      const userId = data?.data?.userId;

      if (canAssignRole && values.role !== "employee" && userId) {
        try {
          await userApi.updateUserRole(userId, values.role);
        } catch (roleError) {
          setRoleWarning(
            roleError?.response?.data?.message ||
              "Account created, but the role could not be updated. You can change it from the user's detail page once they've verified their email."
          );
        }
      }

      onSuccess?.({ userId, email, role: values.role });
    } catch (error) {
      setServerError(error?.response?.data?.message || "Unable to create this account.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </div>
      )}
      {roleWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {roleWarning}
        </div>
      )}

      <Input
        label="Full name"
        required
        error={errors.name?.message}
        {...register("name", {
          required: "Name is required",
          minLength: { value: 2, message: "Name must be at least 2 characters" },
        })}
      />

      <Input
        label="Email address"
        type="email"
        required
        error={errors.email?.message}
        {...register("email", {
          required: "Email is required",
          pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
        })}
      />

      <Input label="Phone" type="tel" placeholder="+1 234 567 8900" error={errors.phone?.message} {...register("phone")} />

      <Input
        label="Temporary password"
        type="password"
        required
        helperText="At least 8 characters, with an uppercase letter, a lowercase letter, and a number."
        error={errors.password?.message}
        {...register("password", {
          required: "Password is required",
          minLength: { value: 8, message: "Password must be at least 8 characters long" },
          validate: {
            uppercase: (value) => /[A-Z]/.test(value) || "Must contain an uppercase letter",
            lowercase: (value) => /[a-z]/.test(value) || "Must contain a lowercase letter",
            number: (value) => /[0-9]/.test(value) || "Must contain a number",
          },
        })}
      />

      <Input
        label="Confirm password"
        type="password"
        required
        error={errors.confirmPassword?.message}
        {...register("confirmPassword", {
          required: "Please confirm the password",
          validate: (value) => value === password || "Passwords do not match",
        })}
      />

      {canAssignRole && (
        <Select
          label="Role"
          options={ROLE_OPTIONS}
          helperText="New accounts start as Employee — choosing another role assigns it right after creation."
          {...register("role")}
        />
      )}

      <Button type="submit" isLoading={isSubmitting} fullWidth>
        Create account
      </Button>
    </form>
  );
};

export default UserCreateForm;
