import { useState } from "react";
import useAuth from "../../hooks/useAuth";

import ProductivityFilters from "../../components/productivity/ProductivityFilters";
import ProductivitySummaryCard from "../../components/productivity/ProductivitySummaryCard";
import ProductivityChart from "../../components/productivity/ProductivityChart";
import ProductivityTrendGraph from "../../components/productivity/ProductivityTrendGraph";
import ProductivityLeaderboard from "../../components/productivity/ProductivityLeaderboard";
import { ChartBarIcon } from "../../components/dashboard/dashboardIcons";

// Roles that can see the org-wide leaderboard and filter by department —
// GET /productivity/leaderboard is restricted to these server-side.
const PRIVILEGED_ROLES = ["super_admin", "admin", "manager"];

const TREND_PERIOD_MAP = { week: "weekly", month: "monthly", quarter: "monthly" };

/**
 * ProductivityPage
 * Personal productivity overview for every authenticated user (score,
 * breakdown, trend), plus an org-wide leaderboard for super_admin/admin/
 * manager. Each child widget fetches its own slice from productivity.api.js;
 * this page just owns the shared period/department filters.
 */
const ProductivityPage = () => {
  const { user: currentUser } = useAuth();
  const isPrivileged = PRIVILEGED_ROLES.includes(currentUser?.role);

  const [filters, setFilters] = useState({ period: "month", department: "" });

  return (
    <div className="space-y-7">
      {/* Hero header — mirrors the dashboard's premium banner treatment */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-primary-600 via-primary-600 to-indigo-700 px-6 py-7 shadow-[0_10px_30px_-12px_rgba(79,70,229,0.45)] dark:border-slate-800 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
            <ChartBarIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">Productivity</h1>
            <p className="mt-1 text-sm text-primary-100/90">
              {isPrivileged
                ? "Track your own performance and see how the team is doing."
                : "Track your performance over time."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-16px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/70">
        <ProductivityFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({ period: "month", department: "" })}
          showDepartment={isPrivileged}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProductivitySummaryCard period={filters.period} title="My Productivity Summary" />
        <ProductivityChart period={filters.period} title="My Productivity" />
      </div>

      <ProductivityTrendGraph
        period={TREND_PERIOD_MAP[filters.period] || "monthly"}
        range={filters.period === "week" ? 8 : 6}
        title="My Trend"
      />

      {isPrivileged && (
        <ProductivityLeaderboard
          period={filters.period}
          department={filters.department}
          title="Team Leaderboard"
        />
      )}
    </div>
  );
};

export default ProductivityPage;
