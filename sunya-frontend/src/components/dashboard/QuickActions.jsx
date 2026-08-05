import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCard from "./DashboardCard";
import Badge from "../common/Badge";
import {
  ClockIcon,
  CheckCircleIcon,
  FolderIcon,
  ChartBarIcon,
  UsersIcon,
  PlusIcon,
  SparkleIcon,
  ArrowUpRightIcon,
} from "./dashboardIcons";
import * as dashboardApi from "../../api/dashboard.api";

/**
 * QuickActions
 * Shortcut links to the most common next steps from the dashboard
 * (clock in/out, tasks, projects, reports), with a live "pending tasks"
 * badge sourced from GET /dashboard/employee.taskSummary.
 *
 * Props:
 *  - pendingCount: number — optional. If omitted, fetched via dashboard.api.js.
 *  - isPrivileged: bool — show admin/manager-only shortcuts (manage users,
 *                  create project). Default false.
 *  - className:    string
 */
const QuickActions = ({ pendingCount, isPrivileged = false, className = "" }) => {
  const [count, setCount] = useState(pendingCount);

  useEffect(() => {
    if (pendingCount !== undefined) {
      setCount(pendingCount);
      return;
    }

    let isMounted = true;
    dashboardApi
      .getEmployeeOverview()
      .then((res) => {
        if (isMounted) setCount(res?.data?.data?.taskSummary?.counts?.pending ?? 0);
      })
      .catch(() => {
        if (isMounted) setCount(undefined);
      });

    return () => {
      isMounted = false;
    };
  }, [pendingCount]);

  const actions = [
    { to: "/my-attendance", label: "Clock In / Out", icon: ClockIcon },
    { to: "/my-tasks", label: "My Tasks", icon: CheckCircleIcon, badge: count },
    { to: "/projects", label: "Projects", icon: FolderIcon },
    { to: "/productivity", label: "Productivity", icon: ChartBarIcon },
    ...(isPrivileged
      ? [
          { to: "/users/create", label: "Add Employee", icon: UsersIcon },
          { to: "/projects/create", label: "New Project", icon: PlusIcon },
        ]
      : []),
  ];

  return (
    <DashboardCard title="Quick Actions" icon={<SparkleIcon className="h-5 w-5" />} className={className}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group/action relative flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-primary-500/40 dark:hover:bg-primary-500/10"
            >
              {Boolean(action.badge) && (
                <Badge variant="danger" size="sm" className="absolute right-2 top-2">
                  {action.badge}
                </Badge>
              )}
              <ArrowUpRightIcon className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity duration-200 group-hover/action:opacity-100 dark:text-slate-600" />
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-100 transition-colors group-hover/action:text-primary-600 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700 dark:group-hover/action:text-primary-400">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
};

export default QuickActions;
