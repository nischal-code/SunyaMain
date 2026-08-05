import { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../common/Input";
import Button from "../common/Button";
import userApi from "../../api/user.api";

/**
 * UserProfileForm
 * Self-service profile editor — PATCH /users/me. Only the fields the
 * backend actually allows on that route (name, phone, department,
 * designation, joiningDate); role/email/isActive are not editable here.
 *
 * Props:
 *  - user:      object — required, the current user (from useAuth() or a fetch)
 *  - onSuccess: fn(updatedUser) — called after a successful save
 */
const UserProfileForm = ({ user, onSuccess }) => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      department: user?.department || "",
      designation: user?.designation || "",
      joiningDate: user?.joiningDate ? user.joiningDate.substring(0, 10) : "",
    },
  });

  const onSubmit = async (values) => {
    setServerError("");
    setSuccessMessage("");
    try {
      const { data } = await userApi.updateProfile({
        name: values.name.trim(),
        phone: values.phone?.trim() || undefined,
        department: values.department?.trim() || undefined,
        designation: values.designation?.trim() || undefined,
        joiningDate: values.joiningDate || undefined,
      });
      setSuccessMessage("Profile updated successfully.");
      onSuccess?.(data?.data?.user);
    } catch (error) {
      setServerError(error?.response?.data?.message || "Unable to update your profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <Input
        label="Full name"
        required
        error={errors.name?.message}
        {...register("name", {
          required: "Name is required",
          minLength: { value: 2, message: "Name must be at least 2 characters" },
          maxLength: { value: 100, message: "Name must be under 100 characters" },
        })}
      />

      <Input label="Phone" type="tel" placeholder="+1 234 567 8900" error={errors.phone?.message} {...register("phone")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Department" placeholder="Engineering" {...register("department")} />
        <Input label="Designation" placeholder="Software Engineer" {...register("designation")} />
      </div>

      <Input label="Joining date" type="date" {...register("joiningDate")} />

      <Button type="submit" isLoading={isSubmitting} disabled={!isDirty || isSubmitting}>
        Save changes
      </Button>
    </form>
  );
};

export default UserProfileForm;
