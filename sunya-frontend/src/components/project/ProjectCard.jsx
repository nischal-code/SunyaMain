import Card from "../common/Card";
import Avatar from "../common/Avatar";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectProgressBar from "./ProjectProgressBar";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const MAX_VISIBLE_MEMBERS = 4;

/**
 * ProjectCard
 * Compact card representation of a project, used by ProjectList in
 * "card" view mode as an alternative to the table.
 *
 * Props:
 *  - project: object — required (name, description, status, progress,
 *      department, deadline, members)
 *  - onClick: fn(project) — optional, makes the card clickable
 *  - className: string
 */
const ProjectCard = ({ project, onClick, className = "" }) => {
  const deadline = formatDate(project.deadline);
  const members = project.members || [];
  const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS);
  const extraCount = members.length - visibleMembers.length;

  return (
    <Card
      className={`transition-shadow ${onClick ? "cursor-pointer hover:shadow-md" : ""} ${className}`}
    >
      <div onClick={onClick ? () => onClick(project) : undefined} className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">{project.name}</h3>
          <ProjectStatusBadge status={project.status} size="sm" />
        </div>

        {project.description && (
          <p className="line-clamp-2 text-xs text-gray-500">{project.description}</p>
        )}

        <ProjectProgressBar
          progress={project.progress ?? 0}
          status={project.status}
          deadline={project.deadline}
          size="sm"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex -space-x-2">
            {visibleMembers.map((member) => (
              <Avatar
                key={member._id}
                src={member.profilePicture?.url}
                name={member.name}
                size="xs"
                className="ring-2 ring-white"
              />
            ))}
            {extraCount > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600 ring-2 ring-white">
                +{extraCount}
              </span>
            )}
          </div>

          {deadline && <p className="text-xs text-gray-400">Due {deadline}</p>}
        </div>

        {project.department && (
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {project.department}
          </p>
        )}
      </div>
    </Card>
  );
};

export default ProjectCard;
