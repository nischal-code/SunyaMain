import { useEffect } from "react";

const VARIANT_CLASSES = {
  success: "border-green-200 bg-green-50 text-green-700",
  error: "border-red-200 bg-red-50 text-red-600",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

const ICONS = {
  success: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

/**
 * Toast
 * A single, self-contained notification banner. Render it (conditionally,
 * e.g. driven by NotificationContext) and it auto-dismisses after
 * `duration` ms by calling `onClose`. Stack multiple instances in a
 * fixed-position container to build a toast list.
 *
 * Props:
 *  - variant:  "success" | "error" | "warning" | "info" — default "info"
 *  - title:    string — optional bold heading
 *  - message:  string — required body text
 *  - duration: number — ms before auto-dismiss, 0 disables it, default 4000
 *  - onClose:  fn — required to actually remove the toast
 */
const Toast = ({ variant = "info", title, message, duration = 4000, onClose }) => {
  useEffect(() => {
    if (!duration) return undefined;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      className={`flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg ${
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.info
      }`}
    >
      {ICONS[variant] || ICONS.info}
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="shrink-0 text-current opacity-60 transition-opacity hover:opacity-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
