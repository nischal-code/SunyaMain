import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";

const PERIOD_OPTIONS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
];

/**
 * ProductivityFilters
 * Filter bar for productivity views (summary, chart, trend, leaderboard).
 * Purely controlled/presentational — it reports changes via `onChange`;
 * the parent (ProductivityPage) owns the actual productivity.api.js calls.
 *
 * Props:
 *  - filters:       { period, department } — required, current values
 *  - onChange:      fn(nextFilters) — required, called with the full merged filters object
 *  - onReset:        fn — required, clears filters back to the default period
 *  - showDepartment: bool — show the department input, default false
 *      (only relevant for privileged roles viewing org-wide/leaderboard data)
 *  - className:      string
 */
const ProductivityFilters = ({
  filters,
  onChange,
  onReset,
  showDepartment = false,
  className = "",
}) => {
  const update = (patch) => onChange({ ...filters, ...patch });

  const hasActiveFilters = Boolean(filters.department) || (filters.period && filters.period !== "month");

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end ${className}`}>
      <Select
        label="Period"
        containerClassName="sm:w-44"
        value={filters.period || "month"}
        onChange={(event) => update({ period: event.target.value })}
        options={PERIOD_OPTIONS}
      />

      {showDepartment && (
        <Input
          label="Department"
          placeholder="All departments"
          containerClassName="sm:w-52"
          value={filters.department || ""}
          onChange={(event) => update({ department: event.target.value })}
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

export default ProductivityFilters;
