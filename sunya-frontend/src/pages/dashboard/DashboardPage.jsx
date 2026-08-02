import { useEffect, useState } from "react";
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

// Roles that can see org-wide data (GET /dashboard is restricted to these
// server-side — see dashboard.routes.js).
const PRIVILEGED_ROLES = ["super_admin", "admin", "manager"];

const DashboardPage = () => {
  const { user } = useAuth();
  const isPrivileged = PRIVILEGED_ROLES.includes(user?.role);

  const [employeeData, setEmployeeData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [orgData, setOrgData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back{employeeData?.welcome?.name ? `, ${employeeData.welcome.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening today.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isPrivileged && (
          <SummaryStatsCard
            label="Total Employees"
            value={orgData?.totalEmployees ?? "—"}
            icon="👥"
            color="primary"
          />
        )}
        <SummaryStatsCard
          label="Tasks Assigned"
          value={employeeData?.taskSummary?.totalAssigned ?? 0}
          icon="🗒️"
          color="info"
        />
        <SummaryStatsCard
          label="Completed Tasks"
          value={summaryData?.completedTasks ?? 0}
          icon="✅"
          color="success"
        />
        <SummaryStatsCard
          label="Pending Reviews"
          value={summaryData?.pendingReviews ?? 0}
          icon="⏳"
          color="warning"
        />
        {!isPrivileged && (
          <SummaryStatsCard
            label="Present Days"
            value={attendance?.presentDays ?? 0}
            icon="📅"
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
