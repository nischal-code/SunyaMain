import { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "../common/Avatar";

/**
 * TaskAssigneeSelector
 * Multi-select control for a task's `assignedTo` list. Renders selected
 * users as removable chips plus a searchable dropdown of the remaining
 * options. Purely controlled — reports the full array of selected user
 * ids via `onChange`; the parent (TaskCreateForm, TaskEditForm,
 * TaskDetailModal) owns fetching the user directory and persisting.
 *
 * Props:
 *  - users:      { value, label, avatarUrl? }[] — required, full assignable
 *      user directory (e.g. from userApi.listUsers)
 *  - value:      string[] — required, currently selected user ids
 *  - onChange:   fn(string[]) — required, called with the updated id array
 *  - label:      string — optional field label
 *  - error:      string — optional error message
 *  - placeholder: string — shown in the search input, default "Search employees…"
 *  - disabled:   bool
 *  - className:  string — extra classes on the outer wrapper
 */
const TaskAssigneeSelector = ({
  users = [],
  value = [],
  onChange,
  label,
  error,
  placeholder = "Search employees…",
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedUsers = useMemo(
    () => value.map((id) => users.find((u) => u.value === id)).filter(Boolean),
    [value, users]
  );

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => (!q || u.label.toLowerCase().includes(q)));
  }, [users, query]);

  const toggleUser = (userId) => {
    if (value.includes(userId)) {
      onChange?.(value.filter((id) => id !== userId));
    } else {
      onChange?.([...value, userId]);
    }
  };

  const removeUser = (userId) => onChange?.(value.filter((id) => id !== userId));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>}

      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${
          disabled ? "cursor-not-allowed bg-gray-50" : "cursor-text bg-white"
        } ${error ? "border-red-400" : "border-gray-300"}`}
      >
        {selectedUsers.map((user) => (
          <span
            key={user.value}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 py-0.5 pl-1 pr-2 text-xs font-medium text-primary-700"
          >
            <Avatar name={user.label} size="xs" />
            <span className="max-w-[10rem] truncate">{user.label}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeUser(user.value);
                }}
                aria-label={`Remove ${user.label}`}
                className="text-primary-400 hover:text-primary-700"
              >
                ×
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedUsers.length ? "" : placeholder}
            className="min-w-[8rem] flex-1 border-none p-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
          />
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {filteredOptions.length === 0 && (
            <p className="px-3.5 py-2 text-sm text-gray-400">No employees found.</p>
          )}
          {filteredOptions.map((user) => {
            const isSelected = value.includes(user.value);
            return (
              <button
                key={user.value}
                type="button"
                onClick={() => toggleUser(user.value)}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                  isSelected ? "bg-primary-50/60" : ""
                }`}
              >
                <input type="checkbox" readOnly checked={isSelected} className="accent-primary-600" />
                <Avatar name={user.label} size="xs" />
                <span className="truncate text-gray-700">{user.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskAssigneeSelector;
