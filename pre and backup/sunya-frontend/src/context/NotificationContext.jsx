import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast from "../components/common/Toast";
import { TOAST_DURATION_MS } from "../utils/constants";

/**
 * NotificationContext
 *
 * App-wide TOAST notification system (ephemeral success/error/info
 * banners) — not to be confused with the domain "Notification" feature
 * (the bell icon backed by GET /notifications, see
 * components/notification/*), which manages its own state.
 *
 * Usage:
 *   const { notify } = useNotification();
 *   notify({ variant: "success", message: "Project created." });
 *   notify({ variant: "error", title: "Update failed", message: getErrorMessage(err) });
 */
const NotificationContext = createContext(null);

let toastIdCounter = 0;

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    ({ variant = "info", title, message, duration = TOAST_DURATION_MS }) => {
      const id = `toast_${Date.now()}_${toastIdCounter++}`;
      setToasts((current) => [...current, { id, variant, title, message, duration }]);
      return id;
    },
    []
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
            <Toast
              variant={toast.variant}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={() => dismiss(toast.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a <NotificationProvider>");
  }
  return context;
};

export default NotificationContext;
