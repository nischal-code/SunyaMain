import { forwardRef } from "react";

/**
 * TextArea
 * Reusable labeled multi-line text input with built-in error/helper
 * text states. Forwards its ref so it works directly with react-hook-form's
 * register().
 *
 * Props:
 *  - label:       string — optional label text
 *  - id / name:   string — used to tie the label to the textarea
 *  - error:       string — error message; also drives the red error styling
 *  - helperText:  string — shown under the textarea when there is no error
 *  - required:    bool — shows a red asterisk next to the label
 *  - rows:        number — default 4
 *  - className:   string — extra classes on the <textarea>
 *  - containerClassName: string — extra classes on the outer wrapper
 *  - ...rest passed through to the underlying <textarea>
 */
const TextArea = forwardRef(
  (
    {
      label,
      id,
      name,
      error,
      helperText,
      required = false,
      rows = 4,
      className = "",
      containerClassName = "",
      ...rest
    },
    ref
  ) => {
    const textareaId = id || name;

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          rows={rows}
          aria-invalid={error ? "true" : "false"}
          className={`w-full resize-y rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
            error
              ? "border-red-400 focus:border-red-400"
              : "border-gray-300 focus:border-primary-500"
          } ${className}`}
          {...rest}
        />

        {error ? (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
