import SearchBar from "../common/SearchBar";
import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";

/**
 * ActivityLogFilters
 * Filter bar for the Activity Log list. Purely controlled/presentational —
 * it reports changes via `onChange`; the parent (ActivityLogPage) owns the
 * actual activityLogApi.listActivityLogs() call and query params.
 *
 * Props:
 *  - filters:  { search, user, module, action, from, to } — required, current values
 *  - onChange: fn(nextFilters) — required, called with the full merged filters object
 *  - onReset:  fn — required, clears all filters
 *  - users:    { _id, name, email }[] — options for the "User" select, default []
 *  - className: string
 */
const ActivityLogFilters = ({ filters, onChange, onReset, users = [], className = "" }) => {
  const update = (patch) => onChange({ ...filters, ...patch });

  const userOptions = users.map((u) => ({ value: u._id, label: u.name || u.email }));

  const hasActiveFilters = Boolean(
    filters.search || filters.user || filters.module || filters.action || filters.from || filters.to
  );

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap ${className}`}>
      <SearchBar
        value={filters.search || ""}
        onChange={(value) => update({ search: value })}
        placeholder="Search action, module, resource…"
        className="sm:w-64"
      />

      <Select
        containerClassName="sm:w-48"
        placeholder="All users"
        value={filters.user || ""}
        onChange={(event) => update({ user: event.target.value })}
        options={userOptions}
      />

      <Input
        containerClassName="sm:w-36"
        placeholder="Module"
        value={filters.module || ""}
        onChange={(event) => update({ module: event.target.value })}
      />

      <Input
        containerClassName="sm:w-36"
        placeholder="Action"
        value={filters.action || ""}
        onChange={(event) => update({ action: event.target.value })}
      />

      <Input
        type="date"
        label="From"
        containerClassName="sm:w-40"
        value={filters.from || ""}
        onChange={(event) => update({ from: event.target.value })}
      />

      <Input
        type="date"
        label="To"
        containerClassName="sm:w-40"
        value={filters.to || ""}
        onChange={(event) => update({ to: event.target.value })}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="md" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default ActivityLogFilters;