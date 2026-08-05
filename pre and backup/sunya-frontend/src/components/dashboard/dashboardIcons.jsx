/**
 * dashboardIcons
 * Small inline SVG icon set used only by the redesigned dashboard
 * widgets. Kept local to `components/dashboard` so the rest of the app
 * (which has no icon library dependency) is untouched.
 *
 * Stroke style intentionally matches the icons already hand-drawn in
 * layouts/Sidebar.jsx (1.8 stroke, 24 viewBox) for visual consistency.
 */
const IconBase = ({ children, className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    {children}
  </svg>
);

export const UsersIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M15 19.5v-1.5a4.5 4.5 0 00-4.5-4.5H6a4.5 4.5 0 00-4.5 4.5v1.5M12.75 6.75a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM19.5 19.5v-1.5a4.5 4.5 0 00-3-4.243M15 6.833a3.375 3.375 0 010 6.334"
    />
  </IconBase>
);

export const ClipboardIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 5.25h6M9 5.25a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5v-12a1.5 1.5 0 00-1.5-1.5M9 5.25a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5M9.75 12.75l1.5 1.5 3-3.5"
    />
  </IconBase>
);

export const CheckCircleIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 12.75l1.5 1.5 3.75-3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </IconBase>
);

export const ClockIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </IconBase>
);

export const CalendarIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 5.25h15a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75z"
    />
  </IconBase>
);

export const TrendUpIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 17l6-6 4 4 8-8M15 7h6v6" />
  </IconBase>
);

export const TrendDownIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7l6 6 4-4 8 8M21 11v6h-6" />
  </IconBase>
);

export const MinusIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14" />
  </IconBase>
);

export const FolderIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3.75 7.5A2.25 2.25 0 016 5.25h3.379a1.5 1.5 0 011.06.44l1.122 1.12a1.5 1.5 0 001.06.44H18a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25v-9.75z"
    />
  </IconBase>
);

export const ChartBarIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 19.5h16.5M6.75 19.5v-6M11.25 19.5V9M15.75 19.5v-9.75M20.25 19.5V4.5" />
  </IconBase>
);

export const PlusIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.5v15m7.5-7.5h-15" />
  </IconBase>
);

export const ArrowUpRightIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 17L17 7M8 7h9v9" />
  </IconBase>
);

export const AlertTriangleIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 9v3.75m0 3h.008v.008H12v-.008zM10.29 3.86L1.82 18a1.5 1.5 0 001.28 2.25h17.8a1.5 1.5 0 001.28-2.25L13.71 3.86a1.5 1.5 0 00-2.42 0z"
    />
  </IconBase>
);

export const InboxIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3.75 9.75L5.4 4.8a1.5 1.5 0 011.42-1.05h10.36a1.5 1.5 0 011.42 1.05l1.65 4.95M3.75 9.75v8.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V9.75M3.75 9.75h4.5l1.06 2.12a1.5 1.5 0 001.34.83h2.7a1.5 1.5 0 001.34-.83l1.06-2.12h4.5"
    />
  </IconBase>
);

export const SparkleIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M9.5 3.5l1.02 2.94a3 3 0 001.87 1.87L15.33 9.3l-2.94 1.02a3 3 0 00-1.87 1.87L9.5 15.13l-1.02-2.94a3 3 0 00-1.87-1.87L3.67 9.3l2.94-1.02a3 3 0 001.87-1.87L9.5 3.5zM18 14l.56 1.6 1.6.56-1.6.56-.56 1.6-.56-1.6-1.6-.56 1.6-.56L18 14z"
    />
  </IconBase>
);
