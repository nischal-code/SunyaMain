import Pagination from "../common/Pagination";
import Avatar from "../common/Avatar";
import Table from "../common/Table";
import ProjectCard from "./ProjectCard";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectProgressBar from "./ProjectProgressBar";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const MAX_VISIBLE_MEMBERS = 3;

/**
 * ProjectList
 * Renders a page of projects as either a table (default) or a card grid.
 * Purely presentational — fetching, filtering, and pagination state all
 * live in the parent (ProjectsPage); this component just renders what
 * it's given.
 *
 * Props:
 *  - projects:          object[] — required, the current page of projects to render
 *  - view:               "table" | "card" — default "table"
 *  - isLoading:          bool — shows a skeleton state
 *  - onView:             fn(project) — required, opens a project's detail
 *  - currentPage / totalPages / onPageChange — optional pagination controls
 *  - emptyMessage:       string — default "No projects found"
 */
const ProjectList = ({
  projects = [],
  view = "table",
  isLoading = false,
  onView,
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage = "No projects found",
}) => {
  if (view === "card") {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 w-full animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      );
    }

    if (!projects.length) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-14 text-center text-sm text-gray-400">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} onClick={onView} />
          ))}
        </div>
        {currentPage && totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        )}
      </div>
    );
  }

  const columns = [
    {
      key: "name",
      header: "Project",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-400">{row.department}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <ProjectStatusBadge status={row.status} />,
    },
    {
      key: "progress",
      header: "Progress",
      className: "min-w-[160px]",
      render: (row) => (
        <ProjectProgressBar
          progress={row.progress ?? 0}
          status={row.status}
          deadline={row.deadline}
          size="sm"
        />
      ),
    },
    {
      key: "members",
      header: "Members",
      render: (row) => {
        const members = row.members || [];
        const visible = members.slice(0, MAX_VISIBLE_MEMBERS);
        const extra = members.length - visible.length;
        return (
          <div className="flex -space-x-2">
            {visible.map((member) => (
              <Avatar
                key={member._id}
                src={member.profilePicture?.url}
                name={member.name}
                size="xs"
                className="ring-2 ring-white"
              />
            ))}
            {extra > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600 ring-2 ring-white">
                +{extra}
              </span>
            )}
          </div>
        );
      },
    },
    { key: "deadline", header: "Deadline", render: (row) => formatDate(row.deadline) },
  ];

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={projects}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onRowClick={onView}
        keyExtractor={(row, index) => row._id ?? index}
      />
      {currentPage && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default ProjectList;
