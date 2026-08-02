import { useForm } from "react-hook-form";
import Select from "../common/Select";
import Input from "../common/Input";
import TextArea from "../common/TextArea";
import Button from "../common/Button";

// Must match the backend's ATTENDANCE_STATUS enum exactly
// (src/utils/constants.js) — Mongoose will reject anything else.
const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "half_day", label: "Half Day" },
  { value: "absent", label: "Absent" },
  { value: "leave", label: "On Leave" },
  { value: "remote", label: "Remote / Work From Home" },
];

/**
 * ManualAttendanceForm
 * Admin/manager form for creating or correcting an attendance entry —
 * POST /attendance/manual (create) or PATCH /attendance/:attendanceId
 * (edit, when `initialValues` includes an id). The parent owns the actual
 * API call via `onSubmit`; this component only collects and validates input.
 *
 * Props:
 *  - userOptions:    { value, label }[] — employees to pick from; omit/leave
 *      empty and pass a fixed `initialValues.userId` when editing a single
 *      user's own record (the field is hidden in that case)
 *  - initialValues:  { userId, date, status, checkIn, checkOut, remarks } — for edit mode
 *  - onSubmit:       fn(values) — required, called with validated form values
 *  - onCancel:       fn — required
 *  - isSubmitting:   bool — disables the form and shows a spinner on submit
 *  - serverError:    string — shown above the fields
 */
const ManualAttendanceForm = ({
  userOptions = [],
  initialValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = "",
}) => {
  const isEditMode = Boolean(initialValues?._id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      userId: initialValues.userId || "",
      date: initialValues.date || "",
      status: initialValues.status || "present",
      checkIn: initialValues.checkIn || "",
      checkOut: initialValues.checkOut || "",
      remarks: initialValues.remarks || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {userOptions.length > 0 && !isEditMode && (
        <Select
          label="Employee"
          required
          placeholder="Select an employee"
          options={userOptions}
          error={errors.userId?.message}
          {...register("userId", { required: "Please select an employee" })}
        />
      )}

      <Input
        type="date"
        label="Date"
        required
        error={errors.date?.message}
        {...register("date", { required: "Date is required" })}
      />

      <Select
        label="Status"
        required
        options={STATUS_OPTIONS}
        error={errors.status?.message}
        {...register("status", { required: "Status is required" })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="time"
          label="Check In"
          error={errors.checkIn?.message}
          {...register("checkIn")}
        />
        <Input
          type="time"
          label="Check Out"
          error={errors.checkOut?.message}
          {...register("checkOut")}
        />
      </div>

      <TextArea
        label="Remarks"
        placeholder="Reason for this manual entry…"
        {...register("remarks")}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditMode ? "Save changes" : "Add entry"}
        </Button>
      </div>
    </form>
  );
};

export default ManualAttendanceForm;