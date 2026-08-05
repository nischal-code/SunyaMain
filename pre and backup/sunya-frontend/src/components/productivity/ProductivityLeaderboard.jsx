import { useEffect, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Pagination from "../common/Pagination";
import * as productivityApi from "../../api/productivity.api";

const RANK_MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

const scoreVariant = (score) => {
  if (score >= 80) return "success";
  if (score >= 50) return "primary";
  return "warning";
};

/**
 * ProductivityLeaderboard
 * Ranked list of employees by productivity score for a period. Backed by
 * GET /productivity/leaderboard (restricted server-side to
 * super_admin/admin/manager).
 *
 * Props:
 *  - entries:    { userId, name, avatar, department, score, tasksCompleted,
 *      trend: "up" | "down" | "flat" }[] — optional. If omitted, the
 *      component fetches it itself via productivity.api.js.
 *  - period:     "week" | "month" | "quarter" — default "month"
 *  - department: string — optional filter, used when the component fetches its own data
 *  - pageSize:   number — page size when the component fetches its own data, default 10
 *  - onSelectUser: fn(entry) — optional, makes rows clickable
 *  - title:      string — default "Leaderboard"
 *  - className:  string
 */
const ProductivityLeaderboard = ({
  entries,
  period = "month",
  department,
  pageSize = 10,
  onSelectUser,
  title = "Leaderboard",
  className = "",
}) => {
  const [rows, setRows] = useState(entries || null);
  const [isLoading, setIsLoading] = useState(!entries);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (entries) {
      setRows(entries);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    productivityApi
      .getLeaderboard({ period, department: department || undefined, page, limit: pageSize })
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data;
        setRows(data?.entries ?? []);
        setTotalPages(data?.totalPages ?? 1);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load the leaderboard");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [entries, period, department, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [period, department]);

  if (isLoading) {
    return (
      <Card title={title} className={className}>
        <Loader text="Loading leaderboard…" />
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

  const list = rows || [];

  if (!list.length) {
    return (
      <Card title={title} className={className}>
        <p className="py-10 text-center text-sm text-gray-400">No productivity data for this period yet.</p>
      </Card>
    );
  }

  return (
    <Card title={title} subtitle={`Top performers · ${period}`} padding={false} className={className}>
      <ul className="divide-y divide-gray-100">
        {list.map((entry, index) => {
          const rank = entry.rank ?? index + 1;
          return (
            <li
              key={entry.userId ?? index}
              onClick={onSelectUser ? () => onSelectUser(entry) : undefined}
              className={`flex items-center gap-4 px-6 py-3.5 ${
                onSelectUser ? "cursor-pointer transition-colors hover:bg-gray-50" : ""
              }`}
            >
              <span className="flex w-7 shrink-0 items-center justify-center text-sm font-semibold text-gray-400">
                {RANK_MEDAL[rank] || rank}
              </span>

              <Avatar src={entry.avatar} name={entry.name} size="sm" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{entry.name || "Unknown"}</p>
                {entry.department && <p className="truncate text-xs text-gray-400">{entry.department}</p>}
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-xs text-gray-400">Tasks</p>
                <p className="text-sm font-medium text-gray-700">{entry.tasksCompleted ?? 0}</p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {entry.trend === "up" && <span className="text-xs text-green-600">▲</span>}
                {entry.trend === "down" && <span className="text-xs text-red-600">▼</span>}
                <Badge variant={scoreVariant(entry.score)} size="md">
                  {entry.score ?? 0}
                </Badge>
              </div>
            </li>
          );
        })}
      </ul>

      {!entries && totalPages > 1 && (
        <div className="border-t border-gray-100 px-6 py-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </Card>
  );
};

export default ProductivityLeaderboard;
