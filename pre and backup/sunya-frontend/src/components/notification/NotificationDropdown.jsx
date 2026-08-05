import { useNavigate } from "react-router-dom";
import NotificationList from "./NotificationList";

/**
 * NotificationDropdown
 * Popover panel rendered by NotificationBell when open. Purely
 * presentational with regard to positioning/outside-click handling —
 * the parent (NotificationBell) owns `isOpen` and wraps both the trigger
 * and this panel in a single click-outside boundary, matching the
 * common/Dropdown.jsx pattern.
 *
 * Props:
 *  - onClose:             fn — required, called after navigating away
 *      (item click, "View all", "Notification settings")
 *  - onUnreadCountChange: fn(count) — forwarded to NotificationList so
 *      NotificationBell can keep its badge count in sync
 *  - className
 */
const NotificationDropdown = ({ onClose, onUnreadCountChange, className = "" }) => {
  const navigate = useNavigate();

  const handleSelectNotification = (notification) => {
    onClose?.();
    navigate(notification?.link || "/notifications");
  };

  const handleViewAll = () => {
    onClose?.();
    navigate("/notifications");
  };

  return (
    <div
      role="menu"
      className={`absolute right-0 z-20 mt-2 w-[22rem] max-w-[90vw] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        <button
          type="button"
          onClick={handleViewAll}
          className="text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          View all
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <NotificationList
          compact
          pageSize={8}
          onSelectNotification={handleSelectNotification}
          onUnreadCountChange={onUnreadCountChange}
        />
      </div>

      <div className="border-t border-gray-100 px-4 py-2.5 text-center">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            navigate("/notifications", { state: { tab: "settings" } });
          }}
          className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          Notification settings
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
