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

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

/**
 * TaskEditForm
 * PATCH /tasks/:taskId (super_admin/admin/manager only) for the task's
 * core fields. If the assignee selection changes it additionally calls
 * PATCH /tasks/:taskId/reassign, since that's a separate endpoint
 * server-side — kept as one form for a simpler editing UX.
 *
 * Props:
 *  - task:      object — required, the task being edited
 *  - users:     { value, label }[] — required, assignable employee directory
 *  - onSuccess: fn(task) — called with the updated task on success
 *  - onCancel:  fn — optional
 */
const TaskEditForm = ({ task, users = [], onSuccess, onCancel }) => {
  const [serverError, setServerError] = useState("");
  const initialAssignees = (task?.assignedTo || []).map((u) => (typeof u === "string" ? u : u._id));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      project: task?.project || "",
      priority: task?.priority || "medium",
      dueDate: toDateInput(task?.dueDate),
      assignedTo: initialAssignees,
    },
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const { data } = await taskApi.updateTask(task._id, {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        project: values.project?.trim() || null,
        priority: values.priority,
        dueDate: values.dueDate || null,
      });
      let updatedTask = data?.data?.task ?? data?.data;

      const assigneesChanged =
        values.assignedTo.length !== initialAssignees.length ||
        values.assignedTo.some((id) => !initialAssignees.includes(id));

      if (assigneesChanged && values.assignedTo.length > 0) {
        const reassignRes = await taskApi.reassignTask(task._id, values.assignedTo);
        updatedTask = reassignRes?.data?.data?.task ?? reassignRes?.data?.data ?? updatedTask;
      }

      onSuccess?.(updatedTask);
    } catch (error) {
      setServerError(error?.response?.data?.message || "Unable to update this task.");
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
        label="Task title"
        required
        error={errors.title?.message}
        {...register("title", {
          required: "Title is required",
          maxLength: { value: 200, message: "Title must be under 200 characters" },
        })}
      />

      <TextArea label="Description" error={errors.description?.message} {...register("description")} />

      <Input label="Project / client" {...register("project")} />

      <Controller
        name="assignedTo"
        control={control}
        rules={{ validate: (val) => val.length > 0 || "Assign at least one employee" }}
        render={({ field }) => (
          <TaskAssigneeSelector
            label="Assigned to"
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
          Save changes
        </Button>
      </div>
    </form>
  );
};

export default TaskEditForm;
