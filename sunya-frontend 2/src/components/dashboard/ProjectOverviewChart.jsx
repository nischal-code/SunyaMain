import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import Loader from "../common/Loader";
import ProgressBar from "../common/ProgressBar";
import StatusPill from "../common/StatusPill";
import { FolderIcon, InboxIcon, AlertTriangleIcon } from "./dashboardIcons";
import * as dashboardApi from "../../api/dashboard.api";

/**
 * ProjectOverviewChart
 * Per-project progress breakdown for the authenticated user's projects.
 * Backed by GET /dashboard/employee/assigned-projects (or /running-projects).
 *
 * Props:
 *  - projects:  array — optional list of { name/project, status, progress, deadline }.
 *               If omitted, the component fetches assigned projects itself.
 *  - source:    "assigned" | "running" — which dashboard.api.js endpoint to
 *               call when `projects` isn't supplied. Default "assigned".
 *  - title:     string — default "Project Overview"
 *  - limit:     number — how many rows to fetch/show. Default 5.
 *  - className: string
 */
const ProjectOverviewChart = ({
  projects,
  source = "assigned",
  title = "Project Overview",
  limit = 5,
  className = "",
}) => {
  const [rows, setRows] = useState(projects || null);
  const [isLoading, setIsLoading] = useState(!projects);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projects) {
      setRows(projects);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetcher =
      source === "running" ? dashboardApi.getRunningProjects : dashboardApi.getAssignedProjects;

    fetcher({ page: 1, limit, sortBy: "deadline" })
      .then((res) => {
        if (isMounted) setRows(res?.data?.data?.projects ?? []);
      })
      .catch((err) => {
        if (isMounted) setError(err?.response?.data?.message || "Unable to load projects");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projects, source, limit]);

  const cardIcon = <FolderIcon className="h-5 w-5" />;

  if (isLoading) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <Loader text="Loading projects…" />
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

  if (!rows?.length) {
    return (
      <DashboardCard title={title} icon={cardIcon} className={className}>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <InboxIcon className="h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400 dark:text-slate-500">No projects to show.</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title={title}
      subtitle={`${rows.length} project${rows.length === 1 ? "" : "s"}`}
      icon={cardIcon}
      className={className}
    >
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((project) => {
          const name = project.name || project.project?.name || "Untitled project";
          const key = project._id || project.project?._id || name;
          const progress = project.progress ?? 0;
          const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : null;

          return (
            <li key={key} className="py-3.5 first:pt-0 last:pb-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {name}
                </span>
                {project.status && <StatusPill status={project.status} />}
              </div>
              <ProgressBar value={progress} showLabel size="sm" />
              {deadline && (
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Due {deadline}</p>
              )}
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
};

export default ProjectOverviewChart;
