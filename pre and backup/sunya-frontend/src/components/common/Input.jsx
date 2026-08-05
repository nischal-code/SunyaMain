import { forwardRef } from "react";

/**
 * Input
 * Reusable labeled text input with built-in error/helper text states.
 * Forwards its ref so it works directly with react-hook-form's register().
 *
 * Props:
 *  - label:       string — optional label text
 *  - id / name:   string — used to tie the label to the input
 *  - error:       string — error message; also drives the red error styling
 *  - helperText:  string — shown under the input when there is no error
 *  - leftIcon / rightIcon: node — optional icon rendered inside the input
 *  - required:    bool — shows a red asterisk next to the label
 *  - className:   string — extra classes on the <input>
 *  - containerClassName: string — extra classes on the outer wrapper
 *  - ...rest passed through to the underlying <input> (type, placeholder, onChange, etc.)
 */
const Input = forwardRef(
  (
    {
      label,
      id,
      name,
      error,
      helperText,
      leftIcon,
      rightIcon,
      required = false,
      className = "",
      containerClassName = "",
      ...rest
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            aria-invalid={error ? "true" : "false"}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon ? "pr-10" : ""} ${
              error
                ? "border-red-400 focus:border-red-400"
                : "border-gray-300 focus:border-primary-500"
            } ${className}`}
            {...rest}
          />

          {rightIcon && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {rightIcon}
            </span>
          )}
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

Input.displayName = "Input";

export default Input;
