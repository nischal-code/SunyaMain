import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import attendanceReducer from "./attendanceSlice";
import projectReducer from "./projectSlice";
import taskReducer from "./taskSlice";
import notificationReducer from "./notificationSlice";
import dashboardReducer from "./dashboardSlice";
import settingsReducer from "./settingsSlice";

/**
 * store.js
 *
 * Central Redux store. Auth flow itself is still owned by AuthContext
 * (see context/AuthContext.jsx) since route guards need synchronous
 * access to it via React context — authSlice mirrors that state for any
 * connected component that prefers reading it from Redux.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    attendance: attendanceReducer,
    projects: projectReducer,
    tasks: taskReducer,
    notifications: notificationReducer,
    dashboard: dashboardReducer,
    settings: settingsReducer,
  },
});

export default store;
