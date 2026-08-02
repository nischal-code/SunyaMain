import { useEffect, useState } from "react";
import Card from "../common/Card";
import ProgressBar from "../common/ProgressBar";
import * as productivityApi from "../../api/productivity.api";

const STAT_CONFIG = [
  { key: "tasksCompleted", label: "Tasks Completed", color: "text-gray-900" },
  { key: "onTimeRate", label: "On-Time Rate", color: "text-green-600", suffix: "%" },
  { key: "attendanceRate", label: "Attendance", color: "text-primary-600", suffix: "%" },
  { key: "avgCompletionHours", label: "Avg Completion", color: "text-amber-600", suffix: "h" },
];

const scoreColor = (score) => {
  if (score >= 80) return "success";
  if (score >= 50) return "primary";
  return "warning";
};

/**
 * ProductivitySummaryCard
 * Compact stat grid summarizing one employee's productivity for a period —
 * score progress bar up top, then tasksCompleted/onTimeRate/attendanceRate/
 * avgCompletionHours below. Backed by GET /productivity/employee (self) or
 * GET /productivity/employee/:userId (admin/manager viewing someone else).
 *
 * Props:
 *  - summary:   { score, tasksCompleted, tasksOnTime, onTimeRate,
 *      attendanceRate, avgCompletionHours, previousScore } — optional.
 *      If omitted, the component fetches it itself via productivity.api.js.
 *  - userId:    string — optional; when provided fetches that employee's
 *      data instead of the authenticated user's own (admin/manager only)
 *  - period:    "week" | "month" | "quarter" — default "month", used when
 *      the component fetches its own data
 *  - title:     string — default "Productivity Summary"
 *  - subtitle:  string
 *  - className: string
 */
const ProductivitySummaryCard = ({
  summary,
  userId,
  period = "month",
  title = "Productivity Summary",
  subtitle,
  className = "",
}) => {
  const [data, setData] = useState(summary || null);
  const [isLoading, setIsLoading] = useState(!summary);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (summary) {
      setData(summary);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const request = userId
      ? productivityApi.getUserProductivity(userId, { period })
      : productivityApi.getMyProductivity({ period });

    request
      .then((res) => {
        if (isMounted) setData(res?.data?.data ?? null);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load productivity summary");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [summary, userId, period]);

  if (error) {
    return (
      <Card title={title} subtitle={subtitle} className={className}>
        <p className="py-6 text-center text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  const score = data?.score ?? 0;
  const delta = data?.previousScore !== undefined ? score - data.previousScore : null;

  return (
    <Card title={title} subtitle={subtitle} className={className}>
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Productivity Score</span>
          {isLoading ? (
            <div className="h-5 w-10 animate-pulse rounded bg-gray-100" />
          ) : (
            <span className="flex items-center gap-1.5 text-lg font-semibold text-gray-900">
              {score}
              {delta !== null && delta !== 0 && (
                <span className={`text-xs font-medium ${delta > 0 ? "text-green-600" : "text-red-600"}`}>
                  {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}
                </span>
              )}
            </span>
          )}
        </div>
        {!isLoading && <ProgressBar value={score} max={100} color={scoreColor(score)} />}
        {isLoading && <div className="h-2.5 w-full animate-pulse rounded-full bg-gray-100" />}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4">
        {STAT_CONFIG.map((stat) => (
          <div key={stat.key} className="text-center">
            {isLoading ? (
              <div className="mx-auto h-6 w-10 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className={`text-xl font-semibold ${stat.color}`}>
                {stat.key === "avgCompletionHours" && data?.[stat.key] !== undefined
                  ? Number(data[stat.key]).toFixed(1)
                  : data?.[stat.key] ?? 0}
                {stat.suffix || ""}
              </p>
            )}
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProductivitySummaryCard;
