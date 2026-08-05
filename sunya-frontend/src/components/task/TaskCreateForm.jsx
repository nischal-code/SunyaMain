import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Input from "../common/Input";
import TextArea from "../common/TextArea";
import Select from "../common/Select";
import Button from "../common/Button";
import TaskAssigneeSelector from "./TaskAssigneeSelector";
import taskApi from "../../api/task.api";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

/**
 * TaskCreateForm
 * POST /tasks (super_admin/admin/manager only).
 *
 * Props:
 *  - users:     { value, label }[] — required, assignable employee directory
 *      (e.g. from userApi.listUsers)
 *  - onSuccess: fn(task) — called with the created task on success
 *  - onCancel:  fn — optional
 */
const TaskCreateForm = ({ users = [], onSuccess, onCancel }) => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      project: "",
      assignedTo: [],
      priority: "medium",
      dueDate: "",
    },
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const { data } = await taskApi.createTask({
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        project: values.project?.trim() || undefined,
        assignedTo: values.assignedTo,
        priority: values.priority,
        dueDate: values.dueDate || undefined,
      });
      onSuccess?.(data?.data?.task ?? data?.data);
    } catch (error) {
      setServerError(error?.response?.data?.message || "Unable to create this task.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {serverError}
        </div>
      )}

      <Input
        label="Task title"
        required
        error={errors.title?.message}
        {...register("title", {
          required: "Title is required",
          maxLength: { value: 200, message: "Title must be under 200 characters" },
        })}
      />

      <TextArea
        label="Description"
        placeholder="What needs to be done?"
        error={errors.description?.message}
        {...register("description")}
      />

      <Input label="Project / client" placeholder="Optional label" {...register("project")} />

      <Controller
        name="assignedTo"
        control={control}
        rules={{ validate: (val) => val.length > 0 || "Assign at least one employee" }}
        render={({ field }) => (
          <TaskAssigneeSelector
            label="Assign to"
            users={users}
            value={field.value}
            onChange={field.onChange}
            error={errors.assignedTo?.message}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" options={PRIORITY_OPTIONS} {...register("priority")} />
        <Input type="date" label="Due date" error={errors.dueDate?.message} {...register("dueDate")} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          Create task
        </Button>
      </div>
    </form>
  );
};

export default TaskCreateForm;
