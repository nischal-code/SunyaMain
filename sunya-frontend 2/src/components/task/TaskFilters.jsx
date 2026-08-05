import SearchBar from "../common/SearchBar";
import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

/**
 * TaskFilters
 * Filter bar for a task list. Purely controlled/presentational — it
 * reports changes via `onChange`; the parent (TasksPage, MyTasksPage)
 * owns the actual taskApi.listTasks() call and query params.
 *
 * Props:
 *  - filters:          { search, status, priority, project, assignedTo } — required, current values
 *  - onChange:         fn(nextFilters) — required, called with the full merged filters object
 *  - onReset:          fn — required, clears all filters
 *  - assigneeOptions:  { value, label }[] — optional, shows an "Assignee" select
 *      when provided (admin-tier task lists only — MyTasksPage omits it)
 *  - className:        string
 */
const TaskFilters = ({ filters, onChange, onReset, assigneeOptions, className = "" }) => {
  const update = (patch) => onChange({ ...filters, ...patch });

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.priority || filters.project || filters.assignedTo
  );

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end ${className}`}>
      <SearchBar
        value={filters.search || ""}
        onChange={(value) => update({ search: value })}
        placeholder="Search tasks…"
        className="sm:w-64"
      />

      <Select
        containerClassName="sm:w-40"
        placeholder="All statuses"
        value={filters.status || ""}
        onChange={(event) => update({ status: event.target.value })}
        options={STATUS_OPTIONS}
      />

      <Select
        containerClassName="sm:w-40"
        placeholder="All priorities"
        value={filters.priority || ""}
        onChange={(event) => update({ priority: event.target.value })}
        options={PRIORITY_OPTIONS}
      />

      <Input
        containerClassName="sm:w-44"
        placeholder="Project"
        value={filters.project || ""}
        onChange={(event) => update({ project: event.target.value })}
      />

      {assigneeOptions && (
        <Select
          containerClassName="sm:w-48"
          placeholder="All assignees"
          value={filters.assignedTo || ""}
          onChange={(event) => update({ assignedTo: event.target.value })}
          options={assigneeOptions}
        />
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="md" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default TaskFilters;
