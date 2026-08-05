import { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../common/Input";
import TextArea from "../common/TextArea";
import Select from "../common/Select";
import Button from "../common/Button";
import projectApi from "../../api/project.api";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

/**
 * ProjectEditForm
 * PATCH /projects/:projectId (super_admin/admin/manager only). Edits the
 * project's core fields, including status — member management stays in
 * ProjectMembersPanel.
 *
 * Props:
 *  - project:   object — required, the project being edited
 *  - onSuccess: fn(project) — called with the updated project on success
 *  - onCancel:  fn — optional
 */
const ProjectEditForm = ({ project, onSuccess, onCancel }) => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      department: project?.department || "",
      priority: project?.priority || "medium",
      status: project?.status || "planning",
      startDate: toDateInput(project?.startDate),
      deadline: toDateInput(project?.deadline),
      budget: project?.budget ?? "",
    },
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const { data } = await projectApi.updateProject(project._id, {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        department: values.department?.trim() || undefined,
        priority: values.priority,
        status: values.status,
        startDate: values.startDate || undefined,
        deadline: values.deadline || undefined,
        budget: values.budget !== "" ? Number(values.budget) : undefined,
      });
      onSuccess?.(data?.data?.project ?? data?.data);
    } catch (error) {
      setServerError(error?.response?.data?.message || "Unable to update this project.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <Input
        label="Project name"
        required
        error={errors.name?.message}
        {...register("name", {
          required: "Project name is required",
          minLength: { value: 2, message: "Name must be at least 2 characters" },
        })}
      />

      <TextArea label="Description" error={errors.description?.message} {...register("description")} />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Department" error={errors.department?.message} {...register("department")} />
        <Select label="Priority" options={PRIORITY_OPTIONS} {...register("priority")} />
      </div>

      <Select label="Status" options={STATUS_OPTIONS} {...register("status")} />

      <div className="grid grid-cols-2 gap-4">
        <Input type="date" label="Start date" error={errors.startDate?.message} {...register("startDate")} />
        <Input type="date" label="Deadline" error={errors.deadline?.message} {...register("deadline")} />
      </div>

      <Input
        type="number"
        label="Budget"
        min="0"
        step="0.01"
        error={errors.budget?.message}
        {...register("budget", {
          min: { value: 0, message: "Budget can't be negative" },
        })}
      />

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
};

export default ProjectEditForm;
