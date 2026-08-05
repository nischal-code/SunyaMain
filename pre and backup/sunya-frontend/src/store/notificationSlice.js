import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as notificationApi from "../api/notification.api";

/**
 * notificationSlice
 *
 * In-app (bell/domain) notifications — GET /notifications, etc. This is
 * distinct from context/NotificationContext.jsx, which drives ephemeral
 * toast popups; components/notification/NotificationBell.jsx currently
 * manages its own polling state locally, so this slice is available for
 * any other connected component (e.g. NotificationsPage) that wants the
 * list/unread-count in Redux instead of a local useFetch call.
 */

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await notificationApi.listNotifications(params);
      return data?.data ?? {};
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      return data?.data?.unreadCount ?? 0;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to load unread count");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markNotificationRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const { data } = await notificationApi.markNotificationRead(notificationId);
      return data?.data?.notification ?? { _id: notificationId, isRead: true };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update notification");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationApi.markAllNotificationsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update notifications");
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  status: "idle",
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Called from useSocketEvents when a "notification:new" socket event arrives,
    // so the badge/list update instantly without waiting for the next poll/fetch.
    notificationReceived: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.notifications ?? action.payload ?? [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index >= 0) state.items[index] = { ...state.items[index], ...action.payload };
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export const { notificationReceived } = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsStatus = (state) => state.notifications.status;

export default notificationSlice.reducer;
