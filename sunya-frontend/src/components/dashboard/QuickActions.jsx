import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../common/Card";
import Badge from "../common/Badge";
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
    { to: "/my-attendance", label: "Clock In / Out", icon: "🕒" },
    { to: "/my-tasks", label: "My Tasks", icon: "✅", badge: count },
    { to: "/projects", label: "Projects", icon: "📁" },
    { to: "/productivity", label: "Productivity", icon: "📈" },
    ...(isPrivileged
      ? [
          { to: "/users/new", label: "Add Employee", icon: "➕" },
          { to: "/projects/new", label: "New Project", icon: "🗂️" },
        ]
      : []),
  ];

  return (
    <Card title="Quick Actions" className={className}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="relative flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-4 text-center transition-colors hover:border-primary-200 hover:bg-primary-50"
          >
            {Boolean(action.badge) && (
              <Badge variant="danger" size="sm" className="absolute right-2 top-2">
                {action.badge}
              </Badge>
            )}
            <span className="text-xl">{action.icon}</span>
            <span className="text-xs font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
