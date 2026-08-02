import Button from "./Button";

/**
 * ErrorState
 * Placeholder shown in place of a page/section when a fetch failed.
 * Pair with utils/apiErrorHandler.js's getErrorMessage() to turn a raw
 * axios error into the `message` prop.
 *
 * Props:
 *  - title:     string — default "Something went wrong"
 *  - message:   string — supporting copy, typically the API error message
 *  - onRetry:   fn     — if provided, renders a "Try again" button
 *  - className: string
 */
const ErrorIcon = () => (
  <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ErrorState = ({ title = "Something went wrong", message, onRetry, className = "" }) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-6 py-12 text-center ${className}`}
    >
      <ErrorIcon />
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {message && <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
