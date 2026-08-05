import SearchBar from "../common/SearchBar";
import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
];

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

/**
 * UserFilters
 * Filter bar for the Users list. Purely controlled/presentational — it
 * reports changes via `onChange`; the parent (UsersPage) owns the actual
 * userApi.listUsers() call and query params.
 *
 * Props:
 *  - filters:  { search, role, isActive, department } — required, current values
 *  - onChange: fn(nextFilters) — required, called with the full merged filters object
 *  - onReset:  fn — required, clears all filters
 *  - className: string
 */
const UserFilters = ({ filters, onChange, onReset, className = "" }) => {
  const update = (patch) => onChange({ ...filters, ...patch });

  const hasActiveFilters = Boolean(
    filters.search || filters.role || filters.isActive || filters.department
  );

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap ${className}`}>
      <SearchBar
        value={filters.search || ""}
        onChange={(value) => update({ search: value })}
        placeholder="Search by name or email…"
        className="sm:w-64"
      />

      <Select
        containerClassName="sm:w-44"
        placeholder="All roles"
        value={filters.role || ""}
        onChange={(event) => update({ role: event.target.value })}
        options={ROLE_OPTIONS}
      />

      <Select
        containerClassName="sm:w-40"
        placeholder="All statuses"
        value={filters.isActive || ""}
        onChange={(event) => update({ isActive: event.target.value })}
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

export default UserFilters;
