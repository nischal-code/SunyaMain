import { useEffect, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import ProgressBar from "../common/ProgressBar";
import StatusPill from "../common/StatusPill";
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

  if (isLoading) {
    return (
      <Card title={title} className={className}>
        <Loader text="Loading projects…" />
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

  if (!rows?.length) {
    return (
      <Card title={title} className={className}>
        <p className="py-10 text-center text-sm text-gray-400">No projects to show.</p>
      </Card>
    );
  }

  return (
    <Card title={title} subtitle={`${rows.length} project${rows.length === 1 ? "" : "s"}`} className={className}>
      <ul className="space-y-4">
        {rows.map((project) => {
          const name = project.name || project.project?.name || "Untitled project";
          const key = project._id || project.project?._id || name;
          const progress = project.progress ?? 0;
          const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : null;

          return (
            <li key={key}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-gray-800">{name}</span>
                {project.status && <StatusPill status={project.status} />}
              </div>
              <ProgressBar value={progress} showLabel size="sm" />
              {deadline && <p className="mt-1 text-xs text-gray-400">Due {deadline}</p>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default ProjectOverviewChart;
