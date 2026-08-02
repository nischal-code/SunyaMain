import { forwardRef } from "react";

/**
 * Select
 * Reusable labeled <select> dropdown with error/helper text states.
 * Forwards its ref so it works directly with react-hook-form's register().
 *
 * Props:
 *  - label:       string — optional label text
 *  - options:     { value, label, disabled? }[] — required
 *  - placeholder: string — rendered as a disabled first option
 *  - error:       string — error message; also drives the red error styling
 *  - helperText:  string — shown under the select when there is no error
 *  - required:    bool — shows a red asterisk next to the label
 *  - className:   string — extra classes on the <select>
 *  - containerClassName: string — extra classes on the outer wrapper
 *  - ...rest passed through to the underlying <select>
 */
const Select = forwardRef(
  (
    {
      label,
      id,
      name,
      options = [],
      placeholder,
      error,
      helperText,
      required = false,
      className = "",
      containerClassName = "",
      ...rest
    },
    ref
  ) => {
    const selectId = id || name;

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            aria-invalid={error ? "true" : "false"}
            defaultValue={placeholder && rest.value === undefined ? "" : undefined}
            className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
              error
                ? "border-red-400 focus:border-red-400"
                : "border-gray-300 focus:border-primary-500"
            } ${className}`}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
