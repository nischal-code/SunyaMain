import { useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./attendanceIcons";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_DOT_CLASSES = {
  present: "bg-emerald-500",
  late: "bg-amber-500",
  absent: "bg-rose-500",
  half_day: "bg-sky-500",
  on_leave: "bg-primary-500",
  leave: "bg-primary-500",
  work_from_home: "bg-sky-500",
  remote: "bg-sky-500",
  holiday: "bg-slate-400",
  weekend: "bg-slate-300 dark:bg-slate-600",
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * AttendanceCalendar
 * Month-grid view of a user's attendance, one status dot per day. Purely
 * presentational + self-contained month navigation — the parent supplies
 * the records for the currently selected month/year and refetches when
 * `onMonthChange` fires.
 *
 * Props:
 *  - month:         number — 1-indexed (1 = January), required
 *  - year:          number — required
 *  - records:       object[] — required, each with { date, status }
 *  - onMonthChange: fn(month, year) — required
 *  - onDayClick:    fn(dateKey, record | null) — optional
 *  - isLoading:     bool
 *  - className:     string
 */
const AttendanceCalendar = ({
  month,
  year,
  records = [],
  onMonthChange,
  onDayClick,
  isLoading = false,
  className = "",
}) => {
  const recordsByDate = useMemo(() => {
    const map = new Map();
    records.forEach((record) => {
      if (!record.date) return;
      map.set(toDateKey(new Date(record.date)), record);
    });
    return map;
  }, [records]);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const leadingBlanks = firstOfMonth.getDay();

    const cells = [];
    for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month - 1, day));
    while (cells.length % 7 !== 0) cells.push(null);

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [month, year]);

  const goToPrevMonth = () => {
    const prev = month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
    onMonthChange?.(prev.month, prev.year);
  };

  const goToNextMonth = () => {
    const next = month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year };
    onMonthChange?.(next.month, next.year);
  };

  const today = toDateKey(new Date());

  return (
    <div
      className={`rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-16px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {MONTH_NAMES[month - 1]} {year}
        </p>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1 transition-opacity duration-200 ${isLoading ? "opacity-50" : ""}`}>
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            if (!date) return <div key={`${weekIndex}-${dayIndex}`} className="aspect-square" />;

            const dateKey = toDateKey(date);
            const record = recordsByDate.get(dateKey) || null;
            const isToday = dateKey === today;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onDayClick?.(dateKey, record)}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  isToday
                    ? "border border-primary-400 font-semibold text-primary-700 dark:border-primary-500/60 dark:text-primary-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>{date.getDate()}</span>
                {record?.status && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      STATUS_DOT_CLASSES[record.status?.toLowerCase()] || "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AttendanceCalendar;
