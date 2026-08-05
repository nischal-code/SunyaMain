/**
 * AttendanceCard
 * Premium content container used only by the redesigned Attendance /
 * My Attendance screens (src/components/attendance/**,
 * pages/attendance/AttendancePage, pages/attendance/MyAttendancePage).
 *
 * This intentionally lives next to the attendance widgets rather than
 * replacing `components/common/Card`, which is shared by every other
 * screen in the app (settings, reports, profile, etc.) and is out of
 * scope for this pass. Mirrors the same pattern already used by
 * `components/dashboard/DashboardCard`.
 *
 * Props mirror common/Card so the two stay easy to reconcile later:
 *  - title / subtitle / icon: optional header content
 *  - actions:  node — right-aligned header content
 *  - footer:   node — optional footer content
 *  - padding:  bool — default true
 *  - className / bodyClassName: string
 */
const AttendanceCard = ({
  title,
  subtitle,
  icon,
  actions,
  footer,
  padding = true,
  className = "",
  bodyClassName = "",
  children,
}) => {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-16px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_36px_-16px_rgba(15,23,42,0.16)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none dark:hover:shadow-none ${className}`}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className={padding ? `p-6 ${bodyClassName}` : bodyClassName}>{children}</div>

      {footer && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3.5 dark:border-slate-800/80 dark:bg-slate-900/40">
          {footer}
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;
