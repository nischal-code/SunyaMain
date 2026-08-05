import { Link, useLocation } from "react-router-dom";

/**
 * Maps a static URL segment to its display label. Segments not listed
 * here fall back to a title-cased version of the raw segment.
 */
const SEGMENT_LABELS = {
  dashboard: "Dashboard",
  users: "Users",
  create: "Create",
  edit: "Edit",
  profile: "My Profile",
  "change-password": "Change Password",
  sessions: "My Sessions",
  attendance: "Attendance",
  "my-attendance": "My Attendance",
  reports: "Reports",
  projects: "Projects",
  tasks: "Tasks",
  "my-tasks": "My Tasks",
  productivity: "Productivity",
  notifications: "Notifications",
  "activity-log": "Activity Log",
  settings: "Office Settings",
  unauthorized: "Unauthorized",
};

// Matches Mongo-style ObjectIds so dynamic :id segments render as a
// generic "Details" crumb instead of a raw hex string.
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

const toTitleCase = (value) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getSegmentLabel = (segment) => {
  if (OBJECT_ID_PATTERN.test(segment)) return "Details";
  return SEGMENT_LABELS[segment] || toTitleCase(segment);
};

/**
 * Breadcrumbs
 * Derives a breadcrumb trail from the current URL so pages don't need
 * to declare their own trail manually. Always starts at Dashboard.
 *
 * Rendered by DashboardLayout above the routed page content.
 */
const Breadcrumbs = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // On the dashboard itself there's nothing to trail beyond the root.
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm font-medium text-gray-500">
        Dashboard
      </nav>
    );
  }

  const crumbs = segments.map((segment, index) => ({
    label: getSegmentLabel(segment),
    path: `/${segments.slice(0, index + 1).join("/")}`,
    isLast: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm font-medium text-gray-500">
      <Link to="/dashboard" className="transition-colors hover:text-gray-700">
        Dashboard
      </Link>

      {crumbs
        .filter((crumb) => crumb.path !== "/dashboard")
        .map((crumb) => (
          <span key={crumb.path} className="flex items-center">
            <svg
              className="mx-1.5 h-3.5 w-3.5 shrink-0 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {crumb.isLast ? (
              <span aria-current="page" className="text-gray-800">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className="transition-colors hover:text-gray-700">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
    </nav>
  );
};

export default Breadcrumbs;
