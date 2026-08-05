import Card from "../common/Card";
import Button from "../common/Button";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectProgressBar from "./ProjectProgressBar";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm font-medium text-gray-900">{value ?? "—"}</p>
  </div>
);

/**
 * ProjectDetailHeader
 * Read-only summary header for a project's detail page — name,
 * description, status, progress, and key dates/budget — with optional
 * Edit/Delete actions for admins/managers. Presentational only; pair it
 * with ProjectEditForm (in a Modal) for the actual edit flow.
 *
 * Props:
 *  - project:   object — required
 *  - canManage: bool — shows the Edit/Delete buttons, default false
 *  - onEdit:    fn — optional, opens the edit form
 *  - onDelete:  fn — optional, opens a delete confirmation
 *  - className: string
 */
const ProjectDetailHeader = ({ project, canManage = false, onEdit, onDelete, className = "" }) => {
  const startDate = formatDate(project.startDate);
  const deadline = formatDate(project.deadline);

  return (
    <Card className={className}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && <p className="mt-2 text-sm text-gray-500">{project.description}</p>}
        </div>

        {canManage && (
          <div className="flex shrink-0 items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-5">
        <ProjectProgressBar
          progress={project.progress ?? 0}
          status={project.status}
          deadline={project.deadline}
          completedTasks={project.completedTasks}
          totalTasks={project.totalTasks}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-4">
        <InfoItem label="Department" value={project.department} />
        <InfoItem label="Start Date" value={startDate} />
        <InfoItem label="Deadline" value={deadline} />
        <InfoItem label="Budget" value={project.budget !== undefined ? `$${Number(project.budget).toLocaleString()}` : null} />
      </div>
    </Card>
  );
};

export default ProjectDetailHeader;
