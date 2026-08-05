/**
 * EmptyState
 * Placeholder shown in place of a list/table when there is no data to
 * display (as opposed to an error — see ErrorState for that case).
 *
 * Props:
 *  - icon:    node   — optional icon/illustration above the text
 *  - title:   string — main message, default "Nothing here yet"
 *  - message: string — supporting copy
 *  - action:  node   — optional action (e.g. a <Button>) rendered below the text
 *  - className: string
 */
const DefaultIcon = () => (
  <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 13.5h6m-8.25 6h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const EmptyState = ({ icon, title = "Nothing here yet", message, action, className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center ${className}`}
    >
      {icon || <DefaultIcon />}
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {message && <p className="mt-1 text-sm text-gray-400">{message}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;
