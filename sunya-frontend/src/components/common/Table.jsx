/**
 * Table
 * Generic data table driven entirely by a columns config, so it can be
 * reused for users, tasks, projects, attendance, etc.
 *
 * Props:
 *  - columns: { key, header, render?(row), align?, className? }[] — required
 *      `render`, if provided, receives the row and returns the cell content.
 *      Falls back to row[column.key].
 *  - data:          object[] — rows to render
 *  - keyExtractor:  fn(row, index) — returns a unique row key, default row.id ?? index
 *  - isLoading:     bool — shows skeleton rows
 *  - emptyMessage:  string — shown when data is empty and not loading
 *  - onRowClick:    fn(row) — optional, makes rows clickable
 */
const ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const Table = ({
  columns = [],
  data = [],
  keyExtractor,
  isLoading = false,
  emptyMessage = "No records found",
  onRowClick,
}) => {
  const getRowKey = (row, index) => keyExtractor?.(row, index) ?? row?.id ?? index;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
                  ALIGN_CLASSES[col.align] || ALIGN_CLASSES.left
                } ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {isLoading &&
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            data.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? "cursor-pointer transition-colors hover:bg-gray-50" : ""}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`whitespace-nowrap px-4 py-3.5 text-gray-700 ${
                      ALIGN_CLASSES[col.align] || ALIGN_CLASSES.left
                    } ${col.className || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
