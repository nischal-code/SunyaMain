import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyOTPPage from "../pages/auth/VerifyOTPPage";

import MyProfilePage from "../pages/profile/MyProfilePage";
import EditProfilePage from "../pages/profile/EditProfilePage";
import ChangePasswordPage from "../pages/profile/ChangePasswordPage";
import MySessionsPage from "../pages/profile/MySessionsPage";

import NotFoundPage from "../pages/errors/NotFoundPage";
import UnauthorizedPage from "../pages/errors/UnauthorizedPage";

import DashboardPage from "../pages/dashboard/DashboardPage";

import ProjectsPage from "../pages/projects/ProjectsPage";
import ProjectDetailPage from "../pages/projects/ProjectDetailPage";
import ProjectCreatePage from "../pages/projects/ProjectCreatePage";

import TasksPage from "../pages/tasks/TasksPage";
import MyTasksPage from "../pages/tasks/MyTasksPage";
import TaskDetailPage from "../pages/tasks/TaskDetailPage";

import ProductivityPage from "../pages/productivity/ProductivityPage";

import AttendancePage from "../pages/attendance/AttendancePage";
import MyAttendancePage from "../pages/attendance/MyAttendancePage";
import AttendanceReportsPage from "../pages/attendance/AttendanceReportsPage";

import UsersPage from "../pages/users/UsersPage";
import UserDetailPage from "../pages/users/UserDetailPage";
import UserCreatePage from "../pages/users/UserCreatePage";

import ActivityLogPage from "../pages/activityLog/ActivityLogPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import OfficeSettingsPage from "../pages/settings/OfficeSettingsPage";

const MANAGE_ROLES = ["super_admin", "admin", "manager"];

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public-only routes (redirect to /dashboard if already logged in) */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
        </Route>
      </Route>

      {/* Authenticated routes — all rendered inside the DashboardLayout shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route element={<RoleBasedRoute allowedRoles={MANAGE_ROLES} />}>
            <Route path="/projects/create" element={<ProjectCreatePage />} />
          </Route>

          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />

          <Route path="/productivity" element={<ProductivityPage />} />

          <Route path="/my-attendance" element={<MyAttendancePage />} />
          <Route element={<RoleBasedRoute allowedRoles={MANAGE_ROLES} />}>
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/attendance/reports" element={<AttendanceReportsPage />} />
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={MANAGE_ROLES} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/create" element={<UserCreatePage />} />
            <Route path="/users/:userId" element={<UserDetailPage />} />
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={["super_admin", "admin"]} />}>
            <Route path="/activity-log" element={<ActivityLogPage />} />
          </Route>

          <Route path="/notifications" element={<NotificationsPage />} />

          <Route element={<RoleBasedRoute allowedRoles={MANAGE_ROLES} />}>
            <Route path="/settings" element={<OfficeSettingsPage />} />
          </Route>

          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/change-password" element={<ChangePasswordPage />} />
          <Route path="/profile/sessions" element={<MySessionsPage />} />
        </Route>
      </Route>

      {/* Error routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
