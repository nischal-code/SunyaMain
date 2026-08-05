/**
 * Pagination
 * Page navigation control with truncated page numbers (1 ... 4 5 6 ... 20).
 *
 * Props:
 *  - currentPage:  number — required, 1-indexed
 *  - totalPages:   number — required
 *  - onPageChange: fn(page) — required
 *  - siblingCount: number — pages shown on either side of the current page, default 1
 */
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const getPageNumbers = (currentPage, totalPages, siblingCount) => {
  const totalVisible = siblingCount * 2 + 5; // first, last, current, 2 sibling groups

  if (totalPages <= totalVisible) return range(1, totalPages);

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    return [...range(1, 3 + siblingCount * 2), "dots-right", totalPages];
  }
  if (showLeftDots && !showRightDots) {
    return [1, "dots-left", ...range(totalPages - (2 + siblingCount * 2), totalPages)];
  }
  return [1, "dots-left", ...range(leftSibling, rightSibling), "dots-right", totalPages];
};

const Pagination = ({ currentPage, totalPages, onPageChange, siblingCount = 1 }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages, siblingCount);
  const baseBtn =
    "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`${baseBtn} text-gray-500 hover:bg-gray-100`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((page, index) =>
        typeof page === "number" ? (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${baseBtn} ${
              page === currentPage ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={`${page}-${index}`} className="px-1.5 text-sm text-gray-400">
            …
          </span>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={`${baseBtn} text-gray-500 hover:bg-gray-100`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
};

export default Pagination;
