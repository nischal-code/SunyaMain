import { useState } from "react";
import useAuth from "../../hooks/useAuth";

import ProductivityFilters from "../../components/productivity/ProductivityFilters";
import ProductivitySummaryCard from "../../components/productivity/ProductivitySummaryCard";
import ProductivityChart from "../../components/productivity/ProductivityChart";
import ProductivityTrendGraph from "../../components/productivity/ProductivityTrendGraph";
import ProductivityLeaderboard from "../../components/productivity/ProductivityLeaderboard";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Productivity</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isPrivileged
            ? "Track your own performance and see how the team is doing."
            : "Track your performance over time."}
        </p>
      </div>

      <ProductivityFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({ period: "month", department: "" })}
        showDepartment={isPrivileged}
      />

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
