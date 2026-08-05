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

/**
 * ProjectCreateForm
 * POST /projects (super_admin/admin/manager only). Members aren't set at
 * creation time — add them afterward from ProjectMembersPanel on the new
 * project's detail page, same division of concerns as
 * UserCreateForm (account) + UserEditForm (role/status).
 *
 * Props:
 *  - onSuccess: fn(project) — called with the created project on success
 */
const ProjectCreateForm = ({ onSuccess }) => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      department: "",
      priority: "medium",
      startDate: "",
      deadline: "",
      budget: "",
    },
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const { data } = await projectApi.createProject({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        department: values.department?.trim() || undefined,
        priority: values.priority,
        startDate: values.startDate || undefined,
        deadline: values.deadline || undefined,
        budget: values.budget ? Number(values.budget) : undefined,
      });
      onSuccess?.(data?.data?.project ?? data?.data);
    } catch (error) {
      setServerError(error?.response?.data?.message || "Unable to create this project.");
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

      <TextArea
        label="Description"
        placeholder="What is this project about?"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Department" error={errors.department?.message} {...register("department")} />
        <Select label="Priority" options={PRIORITY_OPTIONS} {...register("priority")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input type="date" label="Start date" error={errors.startDate?.message} {...register("startDate")} />
        <Input type="date" label="Deadline" error={errors.deadline?.message} {...register("deadline")} />
      </div>

      <Input
        type="number"
        label="Budget"
        min="0"
        step="0.01"
        placeholder="Optional"
        error={errors.budget?.message}
        {...register("budget", {
          min: { value: 0, message: "Budget can't be negative" },
        })}
      />

      <Button type="submit" isLoading={isSubmitting} fullWidth>
        Create project
      </Button>
    </form>
  );
};

export default ProjectCreateForm;
