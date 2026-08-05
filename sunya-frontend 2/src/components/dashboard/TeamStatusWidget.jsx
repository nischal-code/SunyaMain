import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import Loader from "../common/Loader";
import ProgressBar from "../common/ProgressBar";
import { UsersIcon, AlertTriangleIcon } from "./dashboardIcons";
import * as dashboardApi from "../../api/dashboard.api";

const TILES = [
  { key: "totalEmployees", label: "Total", color: "text-slate-900 dark:text-slate-100" },
  { key: "presentEmployees", label: "Present", color: "text-emerald-600 dark:text-emerald-400" },
  { key: "onLeave", label: "On Leave", color: "text-primary-600 dark:text-primary-400" },
  { key: "absentEmployees", label: "Absent", color: "text-rose-600 dark:text-rose-400" },
];

/**
 * TeamStatusWidget
 * Org-wide team presence snapshot for today (total/present/on leave/absent),
 * with a present-rate bar. Backed by GET /dashboard — restricted to
 * super_admin/admin/manager on the server, so this widget should only be
 * rendered for those roles.
 *
 * Props:
 *  - stats:     { totalEmployees, presentEmployees, absentEmployees, onLeave } — optional.
 *               If omitted, the component fetches it itself via dashboard.api.js.
 *  - title:     string — default "Team Status Today"
 *  - className: string
 */
const TeamStatusWidget = ({ stats, title = "Team Status Today", className = "" }) => {
  const [data, setData] = useState(stats || null);
  const [isLoading, setIsLoading] = useState(!stats);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stats) {
      setData(stats);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    dashboardApi
      .getOrgOverview()
      .then((res) => {
        if (isMounted) setData(res?.data?.data ?? null);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load team status");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stats]);

  const cardIcon = <UsersIcon className="h-5 w-5" />;

  if (isLoading) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <Loader text="Loading team status…" />
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <AlertTriangleIcon className="h-6 w-6 text-rose-400" />
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      </DashboardCard>
    );
  }

  const total = data?.totalEmployees || 0;
  const present = data?.presentEmployees || 0;
  const presentPercent = total ? Math.round((present / total) * 100) : 0;

  return (
    <DashboardCard title={title} icon={cardIcon} className={className}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TILES.map((tile) => (
          <div
            key={tile.key}
            className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3.5 text-center dark:border-slate-800 dark:bg-slate-800/40"
          >
            <p className={`text-xl font-semibold tracking-tight ${tile.color}`}>{data?.[tile.key] ?? 0}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Present rate</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{presentPercent}%</span>
        </div>
        <ProgressBar value={present} max={total || 1} color="success" size="sm" />
      </div>
    </DashboardCard>
  );
};

export default TeamStatusWidget;
