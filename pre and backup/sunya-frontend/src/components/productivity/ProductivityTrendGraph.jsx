import { useEffect, useMemo, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import * as productivityApi from "../../api/productivity.api";

const WIDTH = 560;
const HEIGHT = 200;
const PADDING_X = 24;
const PADDING_Y = 24;

/**
 * ProductivityTrendGraph
 * Line chart of an employee's productivity score over time. Backed by
 * GET /productivity/employee/trend (self) or
 * GET /productivity/employee/:userId/trend (admin/manager viewing someone else).
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
  const [hoverIndex, setHoverIndex] = useState(null);

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

  const { path, area, coords, maxScore } = useMemo(() => {
    const series = data || [];
    if (!series.length) return { path: "", area: "", coords: [], maxScore: 100 };

    const max = Math.max(100, ...series.map((p) => p.score || 0));
    const innerWidth = WIDTH - PADDING_X * 2;
    const innerHeight = HEIGHT - PADDING_Y * 2;
    const stepX = series.length > 1 ? innerWidth / (series.length - 1) : 0;

    const pts = series.map((p, index) => {
      const x = PADDING_X + stepX * index;
      const y = PADDING_Y + innerHeight * (1 - (p.score || 0) / max);
      return { x, y, ...p };
    });

    const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const areaPath =
      pts.length > 0
        ? `${linePath} L${pts[pts.length - 1].x},${HEIGHT - PADDING_Y} L${pts[0].x},${HEIGHT - PADDING_Y} Z`
        : "";

    return { path: linePath, area: areaPath, coords: pts, maxScore: max };
  }, [data]);

  if (isLoading) {
    return (
      <Card title={title} className={className}>
        <Loader text="Loading trend…" />
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

  if (!coords.length) {
    return (
      <Card title={title} className={className}>
        <p className="py-10 text-center text-sm text-gray-400">Not enough history to chart a trend yet.</p>
      </Card>
    );
  }

  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;

  return (
    <Card title={title} subtitle={`Last ${coords.length} ${period === "weekly" ? "weeks" : "months"}`} className={className}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" onMouseLeave={() => setHoverIndex(null)}>
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={PADDING_X}
            x2={WIDTH - PADDING_X}
            y1={PADDING_Y + (HEIGHT - PADDING_Y * 2) * fraction}
            y2={PADDING_Y + (HEIGHT - PADDING_Y * 2) * fraction}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        ))}

        <path d={area} fill="#6366f1" fillOpacity={0.08} stroke="none" />
        <path d={path} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {coords.map((p, index) => (
          <g key={`${p.label}-${index}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === index ? 5 : 3.5}
              fill="#ffffff"
              stroke="#6366f1"
              strokeWidth={2}
              onMouseEnter={() => setHoverIndex(index)}
              className="cursor-pointer"
            />
            <rect
              x={p.x - 16}
              y={PADDING_Y}
              width={32}
              height={HEIGHT - PADDING_Y * 2}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(index)}
              className="cursor-pointer"
            />
            <text x={p.x} y={HEIGHT - 4} textAnchor="middle" className="fill-gray-400 text-[10px]">
              {p.label}
            </text>
          </g>
        ))}

        {hovered && (
          <g>
            <line x1={hovered.x} x2={hovered.x} y1={PADDING_Y} y2={HEIGHT - PADDING_Y} stroke="#c7d2fe" strokeWidth={1} />
            <rect
              x={Math.min(Math.max(hovered.x - 20, 0), WIDTH - 40)}
              y={hovered.y - 28}
              width={40}
              height={20}
              rx={5}
              fill="#111827"
            />
            <text
              x={Math.min(Math.max(hovered.x, 20), WIDTH - 20)}
              y={hovered.y - 14}
              textAnchor="middle"
              className="fill-white text-[11px] font-semibold"
            >
              {hovered.score}
            </text>
          </g>
        )}
      </svg>

      <p className="mt-2 text-right text-xs text-gray-400">Scale: 0–{maxScore}</p>
    </Card>
  );
};

export default ProductivityTrendGraph;
