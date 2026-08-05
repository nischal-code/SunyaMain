import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/*                                                                      */
/* Small inline icon set, matching the stroke style already used in    */
/* components/notification/NotificationBell.jsx (1.8 stroke, 24 vb).   */
/* ------------------------------------------------------------------ */
const IconWrapper = ({ children }) => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {children}
  </svg>
);

const DashboardIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3.75 12h4.5v8.25h-4.5V12zM9.75 3.75h4.5v16.5h-4.5V3.75zM15.75 8.25h4.5v12h-4.5v-12z"
    />
  </IconWrapper>
);

const UsersIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M15 19.5v-1.5a4.5 4.5 0 00-4.5-4.5H6a4.5 4.5 0 00-4.5 4.5v1.5M12.75 6.75a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM19.5 19.5v-1.5a4.5 4.5 0 00-3-4.243M15 6.833a3.375 3.375 0 010 6.334"
    />
  </IconWrapper>
);

const AttendanceIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </IconWrapper>
);

const CalendarIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 5.25h15a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75z"
    />
  </IconWrapper>
);

const ProjectsIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3.75 7.5A2.25 2.25 0 016 5.25h3.379a1.5 1.5 0 011.06.44l1.122 1.12a1.5 1.5 0 001.06.44H18a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25v-9.75z"
    />
  </IconWrapper>
);

const TasksIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 12.75l1.5 1.5 3.75-3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </IconWrapper>
);

const MyTasksIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 5.25h6M9 5.25a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5v-12a1.5 1.5 0 00-1.5-1.5M9 5.25a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5M9.75 12.75l1.5 1.5 3-3.5"
    />
  </IconWrapper>
);

const ProductivityIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3.75 19.5h16.5M6.75 19.5v-6M11.25 19.5V9M15.75 19.5v-9.75M20.25 19.5V4.5"
    />
  </IconWrapper>
);

const NotificationsIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </IconWrapper>
);

const ActivityLogIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M4.5 6h15M4.5 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4.5 12h15M4.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4.5 18h15M4.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
    />
  </IconWrapper>
);

const SettingsIcon = () => (
  <IconWrapper>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.774.773c.39.39.44.998.12 1.45l-.527.738c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.452.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.45.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.452.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.807.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.738.527c.35.25.806.272 1.203.107.397-.165.71-.505.781-.93l.149-.893z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </IconWrapper>
);

/* ------------------------------------------------------------------ */
/* Nav config                                                           */
/*                                                                      */
/* `roles: null` means visible to every authenticated role. Otherwise   */
/* the current user's role must be included in the array.               */
/* ------------------------------------------------------------------ */
const NAV_SECTIONS = [
  {
    title: null,
    items: [{ label: "Dashboard", to: "/dashboard", icon: DashboardIcon, roles: null }],
  },
  {
    title: "Workspace",
    items: [
      { label: "Projects", to: "/projects", icon: ProjectsIcon, roles: null },
      { label: "Tasks", to: "/tasks", icon: TasksIcon, roles: null },
      { label: "My Tasks", to: "/my-tasks", icon: MyTasksIcon, roles: null },
      { label: "Productivity", to: "/productivity", icon: ProductivityIcon, roles: null },
    ],
  },
  {
    title: "Attendance",
    items: [
      {
        label: "Attendance",
        to: "/attendance",
        icon: AttendanceIcon,
        roles: ["super_admin", "admin", "manager"],
      },
      { label: "My Attendance", to: "/my-attendance", icon: CalendarIcon, roles: null },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        label: "Users",
        to: "/users",
        icon: UsersIcon,
        roles: ["super_admin", "admin", "manager"],
      },
      { label: "Activity Log", to: "/activity-log", icon: ActivityLogIcon, roles: ["super_admin", "admin"] },
      {
        label: "Office Settings",
        to: "/settings",
        icon: SettingsIcon,
        roles: ["super_admin", "admin", "manager"],
      },
    ],
  },
  {
    title: null,
    items: [{ label: "Notifications", to: "/notifications", icon: NotificationsIcon, roles: null }],
  },
];

const navLinkClasses = ({ isActive }) =>
  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary-50 text-primary-700"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

/**
 * Sidebar
 * Primary app navigation. Renders as a fixed column on desktop (lg+) and
 * as a slide-over drawer with a backdrop on smaller screens, controlled
 * by the `isOpen` / `onClose` props owned by DashboardLayout.
 *
 * Nav items are filtered by the authenticated user's role, mirroring the
 * access rules enforced server-side and by RoleBasedRoute.
 *
 * Props:
 *  - isOpen:  bool — whether the mobile drawer is open (ignored on lg+)
 *  - onClose: fn   — called to close the mobile drawer (backdrop click,
 *      Escape, or after a nav link is followed)
 */
const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user } = useAuth();

  const isVisible = (roles) => !roles || (user && roles.includes(user.role));

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-gray-100 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white overflow-hidden">
          <img src="/logo.svg" alt="" />
        </span>
        <span className="text-base font-semibold text-gray-900">Sunya</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section, sectionIndex) => {
          const visibleItems = section.items.filter((item) => isVisible(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title || `section-${sectionIndex}`}>
              {section.title && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map(({ label, to, icon: Icon }) => (
                  <NavLink key={to} to={to} onClick={onClose} className={navLinkClasses}>
                    <Icon />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {user && (
        <div className="shrink-0 border-t border-gray-100 px-4 py-4">
          <p className="truncate text-xs text-gray-400">Signed in as</p>
          <p className="truncate text-sm font-semibold text-gray-800">{user.name || user.email}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-white lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isOpen}
      >
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-gray-900/50 transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-64 max-w-[80vw] bg-white shadow-xl transition-transform duration-200 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
