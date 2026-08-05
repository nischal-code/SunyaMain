/**
 * attendanceIcons
 * Small inline SVG icon set used only by the redesigned Attendance /
 * My Attendance screens. Kept local to `components/attendance` so the
 * rest of the app is untouched — mirrors `components/dashboard/dashboardIcons`.
 *
 * Stroke style intentionally matches dashboardIcons (1.8 stroke, 24 viewBox)
 * for visual consistency across the two redesigned areas.
 */
const IconBase = ({ children, className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    {children}
  </svg>
);

export const CalendarIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 6h15a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6.75A.75.75 0 014.5 6z"
    />
  </IconBase>
);

export const ClockIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 7.5v5.25l3 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </IconBase>
);

export const AlertTriangleIcon = (props) => (
  <IconBase {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 9v3.75m0 3h.008v.008H12v-.008zM9.401 3.6a2.25 2.25 0 015.198 0l7.15 12.86A2.25 2.25 0 0119.65 20H4.35a2.25 2.25 0 01-1.951-3.54L9.401 3.6z"
    />
  </IconBase>
);

export const ChevronLeftIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
  </IconBase>
);

export const ChevronRightIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
  </IconBase>
);

export const PlusIcon = (props) => (
  <IconBase {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.5v15m7.5-7.5h-15" />
  </IconBase>
);
