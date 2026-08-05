import { useState } from "react";

/**
 * SearchBar
 * Controlled or uncontrolled search input with a search icon and a
 * clear (×) button. Pass `value` + `onChange` to control it, or leave
 * uncontrolled and read the value via `onSearch`.
 *
 * Props:
 *  - value:       string — controlled value
 *  - onChange:    fn(value) — called on every keystroke when controlled
 *  - onSearch:    fn(value) — called on submit (Enter); also called on every
 *      change when uncontrolled (no `value` prop supplied)
 *  - placeholder: string — default "Search..."
 */
const SearchBar = ({ value, onChange, onSearch, placeholder = "Search...", className = "" }) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState("");
  const currentValue = isControlled ? value : internalValue;

  const updateValue = (nextValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
      onSearch?.(nextValue);
    }
    onChange?.(nextValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(currentValue);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </span>

      <input
        type="search"
        value={currentValue}
        onChange={(event) => updateValue(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-9 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      />

      {currentValue && (
        <button
          type="button"
          onClick={() => updateValue("")}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </form>
  );
};

export default SearchBar;
