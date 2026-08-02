import SearchBar from "../common/SearchBar";
import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/**
 * ProjectFilters
 * Filter bar for the Projects list. Purely controlled/presentational — it
 * reports changes via `onChange`; the parent (ProjectsPage) owns the
 * actual projectApi.listProjects() call and query params.
 *
 * Props:
 *  - filters:  { search, status, department } — required, current values
 *  - onChange: fn(nextFilters) — required, called with the full merged filters object
 *  - onReset:  fn — required, clears all filters
 *  - className: string
 */
const ProjectFilters = ({ filters, onChange, onReset, className = "" }) => {
  const update = (patch) => onChange({ ...filters, ...patch });

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.department);

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap ${className}`}>
      <SearchBar
        value={filters.search || ""}
        onChange={(value) => update({ search: value })}
        placeholder="Search projects…"
        className="sm:w-64"
      />

      <Select
        containerClassName="sm:w-44"
        placeholder="All statuses"
        value={filters.status || ""}
        onChange={(event) => update({ status: event.target.value })}
        options={STATUS_OPTIONS}
      />

      <Input
        containerClassName="sm:w-44"
        placeholder="Department"
        value={filters.department || ""}
        onChange={(event) => update({ department: event.target.value })}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="md" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default ProjectFilters;
