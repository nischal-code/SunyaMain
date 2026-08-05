import SearchBar from "../common/SearchBar";
import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "half_day", label: "Half Day" },
  { value: "on_leave", label: "On Leave" },
  { value: "work_from_home", label: "Work From Home" },
  { value: "holiday", label: "Holiday" },
];

/**
 * AttendanceFilters
 * Filter bar for attendance lists/reports. Purely controlled/presentational
 * — it reports changes via `onChange`; the parent page owns the actual
 * attendanceApi call and query params.
 *
 * Props:
 *  - filters:    { search, status, department, startDate, endDate } — required, current values
 *  - onChange:   fn(nextFilters) — required, called with the full merged filters object
 *  - onReset:    fn — required, clears all filters
 *  - showSearch: bool — shows the employee search box (org-wide views only), default false
 *  - className:  string
 */
const AttendanceFilters = ({ filters, onChange, onReset, showSearch = false, className = "" }) => {
  const update = (patch) => onChange({ ...filters, ...patch });

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.department || filters.startDate || filters.endDate
  );

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap ${className}`}>
      {showSearch && (
        <SearchBar
          value={filters.search || ""}
          onChange={(value) => update({ search: value })}
          placeholder="Search by employee name…"
          className="sm:w-60"
        />
      )}

      <Select
        containerClassName="sm:w-44"
        placeholder="All statuses"
        value={filters.status || ""}
        onChange={(event) => update({ status: event.target.value })}
        options={STATUS_OPTIONS}
      />

      {showSearch && (
        <Input
          containerClassName="sm:w-40"
          placeholder="Department"
          value={filters.department || ""}
          onChange={(event) => update({ department: event.target.value })}
        />
      )}

      <Input
        type="date"
        label="From"
        containerClassName="sm:w-40"
        value={filters.startDate || ""}
        onChange={(event) => update({ startDate: event.target.value })}
      />

      <Input
        type="date"
        label="To"
        containerClassName="sm:w-40"
        value={filters.endDate || ""}
        onChange={(event) => update({ endDate: event.target.value })}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="md" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default AttendanceFilters;
