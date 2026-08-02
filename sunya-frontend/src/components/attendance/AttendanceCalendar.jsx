import { useMemo } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_DOT_CLASSES = {
  present: "bg-green-500",
  late: "bg-amber-500",
  absent: "bg-red-500",
  half_day: "bg-blue-500",
  on_leave: "bg-primary-500",
  work_from_home: "bg-blue-500",
  holiday: "bg-gray-400",
  weekend: "bg-gray-300",
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
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-gray-900">
          {MONTH_NAMES[month - 1]} {year}
        </p>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1 ${isLoading ? "opacity-50" : ""}`}>
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
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors hover:bg-gray-50 ${
                  isToday ? "border border-primary-400 font-semibold text-primary-700" : "text-gray-700"
                }`}
              >
                <span>{date.getDate()}</span>
                {record?.status && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      STATUS_DOT_CLASSES[record.status?.toLowerCase()] || "bg-gray-300"
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
