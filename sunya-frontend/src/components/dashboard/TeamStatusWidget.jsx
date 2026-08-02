import { useEffect, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import ProgressBar from "../common/ProgressBar";
import * as dashboardApi from "../../api/dashboard.api";

const TILES = [
  { key: "totalEmployees", label: "Total", color: "text-gray-900" },
  { key: "presentEmployees", label: "Present", color: "text-green-600" },
  { key: "onLeave", label: "On Leave", color: "text-primary-600" },
  { key: "absentEmployees", label: "Absent", color: "text-red-600" },
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

  if (isLoading) {
    return (
      <Card title={title} className={className}>
        <Loader text="Loading team status…" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={title} className={className}>
        <p className="py-6 text-center text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  const total = data?.totalEmployees || 0;
  const present = data?.presentEmployees || 0;
  const presentPercent = total ? Math.round((present / total) * 100) : 0;

  return (
    <Card title={title} className={className}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TILES.map((tile) => (
          <div key={tile.key} className="rounded-xl bg-gray-50 px-3 py-3 text-center">
            <p className={`text-xl font-semibold ${tile.color}`}>{data?.[tile.key] ?? 0}</p>
            <p className="mt-0.5 text-xs text-gray-500">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>Present rate</span>
          <span className="font-medium text-gray-700">{presentPercent}%</span>
        </div>
        <ProgressBar value={present} max={total || 1} color="success" size="sm" />
      </div>
    </Card>
  );
};

export default TeamStatusWidget;
