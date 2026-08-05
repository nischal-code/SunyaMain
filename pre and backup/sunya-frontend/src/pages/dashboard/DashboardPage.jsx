import { useEffect, useMemo, useState } from "react";
import useAuth from "../../hooks/useAuth";
import * as dashboardApi from "../../api/dashboard.api";

import SummaryStatsCard from "../../components/dashboard/SummaryStatsCard";
import AttendanceOverviewChart from "../../components/dashboard/AttendanceOverviewChart";
import TaskOverviewChart from "../../components/dashboard/TaskOverviewChart";
import ProjectOverviewChart from "../../components/dashboard/ProjectOverviewChart";
import RecentActivityFeed from "../../components/dashboard/RecentActivityFeed";
import TeamStatusWidget from "../../components/dashboard/TeamStatusWidget";
import QuickActions from "../../components/dashboard/QuickActions";
import Loader from "../../components/common/Loader";
import {
  UsersIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  AlertTriangleIcon,
} from "../../components/dashboard/dashboardIcons";

// Roles that can see org-wide data (GET /dashboard is restricted to these
// server-side — see dashboard.routes.js).
const PRIVILEGED_ROLES = ["super_admin", "admin", "manager"];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const DashboardPage = () => {
  const { user } = useAuth();
  const isPrivileged = PRIVILEGED_ROLES.includes(user?.role);

  const [employeeData, setEmployeeData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [orgData, setOrgData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const greeting = useMemo(getGreeting, []);
  const today = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      const calls = [dashboardApi.getEmployeeOverview(), dashboardApi.getDashboardSummary()];
      if (isPrivileged) calls.push(dashboardApi.getOrgOverview());

      const results = await Promise.allSettled(calls);
      if (!isMounted) return;

      const [employeeRes, summaryRes, orgRes] = results;

      if (employeeRes.status === "fulfilled") {
        setEmployeeData(employeeRes.value?.data?.data ?? null);
      }
      if (summaryRes.status === "fulfilled") {
        setSummaryData(summaryRes.value?.data?.data ?? null);
      }
      if (isPrivileged && orgRes?.status === "fulfilled") {
        setOrgData(orgRes.value?.data?.data ?? null);
      }

      if (employeeRes.status === "rejected" && summaryRes.status === "rejected") {
        setError("Unable to load your dashboard right now. Please try again shortly.");
      }

      setIsLoading(false);
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [isPrivileged]);

  if (isLoading) {
    return <Loader fullScreen text="Loading your dashboard…" />;
  }

  const attendance = summaryData?.attendanceSummary;

  return (
    <div className="space-y-7">
      {/* Hero / welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-primary-600 via-primary-600 to-indigo-700 px-6 py-8 shadow-[0_10px_30px_-12px_rgba(79,70,229,0.45)] dark:border-slate-800 sm:px-8">
        {/* Decorative glow accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-1">
          <p className="text-sm font-medium text-primary-100">{today}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
            {greeting}
            {employeeData?.welcome?.name ? `, ${employeeData.welcome.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-primary-100/90">Here's what's happening with your work today.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
          <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isPrivileged && (
          <SummaryStatsCard
            label="Total Employees"
            value={orgData?.totalEmployees ?? "—"}
            icon={<UsersIcon className="h-5 w-5" />}
            color="primary"
          />
        )}
        <SummaryStatsCard
          label="Tasks Assigned"
          value={employeeData?.taskSummary?.totalAssigned ?? 0}
          icon={<ClipboardIcon className="h-5 w-5" />}
          color="info"
        />
        <SummaryStatsCard
          label="Completed Tasks"
          value={summaryData?.completedTasks ?? 0}
          icon={<CheckCircleIcon className="h-5 w-5" />}
          color="success"
        />
        <SummaryStatsCard
          label="Pending Reviews"
          value={summaryData?.pendingReviews ?? 0}
          icon={<ClockIcon className="h-5 w-5" />}
          color="warning"
        />
        {!isPrivileged && (
          <SummaryStatsCard
            label="Present Days"
            value={attendance?.presentDays ?? 0}
            icon={<CalendarIcon className="h-5 w-5" />}
            color="primary"
          />
        )}
      </div>

      {/* Org-wide widgets — privileged roles only */}
      {isPrivileged && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TeamStatusWidget stats={orgData} />
          <AttendanceOverviewChart data={orgData} />
        </div>
      )}

      {/* Personal task/project overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TaskOverviewChart counts={employeeData?.taskSummary?.counts} />
        <ProjectOverviewChart source="assigned" limit={5} />
      </div>

      {/* Activity + quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentActivityFeed activity={employeeData?.recentActivity} className="lg:col-span-2" />
        <QuickActions pendingCount={employeeData?.taskSummary?.counts?.pending} isPrivileged={isPrivileged} />
      </div>
    </div>
  );
};

export default DashboardPage;
