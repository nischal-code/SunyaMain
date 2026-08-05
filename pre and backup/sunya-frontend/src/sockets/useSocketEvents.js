import { useEffect } from "react";
import { useDispatch } from "react-redux";
import useSocket from "../hooks/useSocket";
import { notificationReceived } from "../store/notificationSlice";
import { useNotification } from "../context/NotificationContext";

/**
 * useSocketEvents
 *
 * App-wide socket event wiring. Mount this once near the root of the
 * authenticated app (see App.jsx) so every "notification:new" event
 * emitted by the backend (src/services/notification.service.js) both:
 *   - lands in Redux (notificationSlice) for any connected component, and
 *   - surfaces as a toast via NotificationContext.
 *
 * NotificationBell keeps its own polling loop as a fallback/baseline, so
 * this is additive — a dropped socket connection degrades gracefully
 * back to the existing 30s poll.
 */
const useSocketEvents = () => {
  const dispatch = useDispatch();
  const { on } = useSocket();
  const { notify } = useNotification();

  useEffect(() => {
    const unsubscribe = on("notification:new", (notification) => {
      dispatch(notificationReceived(notification));
      notify({
        variant: "info",
        title: notification?.title || "New notification",
        message: notification?.message || "You have a new notification.",
      });
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, dispatch]);
};

export default useSocketEvents;
