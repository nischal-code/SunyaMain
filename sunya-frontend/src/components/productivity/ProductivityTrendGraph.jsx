import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "../dashboard/DashboardCard";
import Loader from "../common/Loader";
import * as productivityApi from "../../api/productivity.api";

const LINE_COLOR = "#6366f1";

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
      <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: LINE_COLOR }} />
        Score: {payload[0].value}
      </p>
    </div>
  );
};

// Custom dot: bigger + filled on hover (Recharts passes the active index
// to every dot on the chart, so we compare against it manually).
const renderDot = (props) => {
  const { cx, cy, index, activeIndex } = props;
  const isActive = index === activeIndex;
  return (
    <circle
      key={`dot-${index}`}
      cx={cx}
      cy={cy}
      r={isActive ? 5.5 : 3.5}
      fill="#ffffff"
      stroke={LINE_COLOR}
      strokeWidth={2}
      className="cursor-pointer transition-all duration-150"
    />
  );
};

/**
 * ProductivityTrendGraph
 * Line/area chart of an employee's productivity score over time. Backed
 * by GET /productivity/employee/trend (self) or
 * GET /productivity/employee/:userId/trend (admin/manager viewing someone
 * else). Rendered with a Recharts AreaChart: the line draws in on load,
 * and hovering a point shows a tooltip with an enlarged dot + guide line.
 *
 * Props:
 *  - points:    { label, score }[] — optional. If omitted, the component
 *      fetches it itself via productivity.api.js.
 *  - userId:    string — optional; when provided fetches that employee's
 *      trend instead of the authenticated user's own (admin/manager only)
 *  - period:    "weekly" | "monthly" — default "monthly", granularity of points
 *  - range:     number — how many points to request, default 6
 *  - title:     string — default "Productivity Trend"
 *  - className: string
 */
const ProductivityTrendGraph = ({
  points,
  userId,
  period = "monthly",
  range = 6,
  title = "Productivity Trend",
  className = "",
}) => {
  const [data, setData] = useState(points || null);
  const [isLoading, setIsLoading] = useState(!points);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (points) {
      setData(points);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const request = userId
      ? productivityApi.getUserProductivityTrend(userId, { period, range })
      : productivityApi.getMyProductivityTrend({ period, range });

    request
      .then((res) => {
        if (isMounted) setData(res?.data?.data?.points ?? []);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load the productivity trend");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [points, userId, period, range]);

  const { series, maxScore } = useMemo(() => {
    const s = data || [];
    const max = Math.max(100, ...s.map((p) => p.score || 0));
    return { series: s, maxScore: max };
  }, [data]);

  if (isLoading) {
    return (
      <DashboardCard title={title} className={className}>
        <Loader text="Loading trend…" />
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title={title} className={className}>
        <p className="py-6 text-center text-sm text-rose-600">{error}</p>
      </DashboardCard>
    );
  }

  if (!series.length) {
    return (
      <DashboardCard title={title} className={className}>
        <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
          Not enough history to chart a trend yet.
        </p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title={title}
      subtitle={`Last ${series.length} ${period === "weekly" ? "weeks" : "months"}`}
      className={className}
    >
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 10, right: 12, bottom: 0, left: -18 }}
            onMouseMove={(state) => {
              if (state?.isTooltipActive) setActiveIndex(state.activeTooltipIndex);
              else setActiveIndex(null);
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="productivityTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={LINE_COLOR} stopOpacity={0.28} />
                <stop offset="95%" stopColor={LINE_COLOR} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis
              domain={[0, maxScore]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              width={30}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: "#c7d2fe", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={LINE_COLOR}
              strokeWidth={2.5}
              fill="url(#productivityTrendFill)"
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
              activeDot={{ r: 5.5, stroke: LINE_COLOR, strokeWidth: 2, fill: "#ffffff" }}
              dot={(props) => renderDot({ ...props, activeIndex })}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-right text-xs text-slate-400 dark:text-slate-500">Scale: 0–{maxScore}</p>
    </DashboardCard>
  );
};

export default ProductivityTrendGraph;
