import { useCallback, useMemo, useState } from "react";

/**
 * usePagination
 *
 * Local pagination state that lines up with the Sunya API's pagination
 * envelope, returned by every paginated list endpoint (GET /projects,
 * GET /tasks, GET /activity-logs, ...):
 *
 *   { data: { <items>, pagination: { total, page, limit, totalPages } } }
 *
 * It only owns page/limit/total state — fetching is left to useFetch (or
 * whatever the caller already uses), so the two compose naturally.
 *
 * Usage:
 *   const pagination = usePagination({ initialLimit: 20 });
 *
 *   const { data, isLoading } = useFetch(
 *     () => projectApi.listProjects({ page: pagination.page, limit: pagination.limit }),
 *     [pagination.page, pagination.limit]
 *   );
 *
 *   useEffect(() => {
 *     if (data?.pagination) pagination.syncFromResponse(data.pagination);
 *   }, [data]);
 *
 *   <Table rows={data?.projects} ... />
 *   <Pagination
 *     currentPage={pagination.page}
 *     totalPages={pagination.totalPages}
 *     onPageChange={pagination.setPage}
 *   />
 *
 * @param {Object} options
 * @param {number} options.initialPage - default 1
 * @param {number} options.initialLimit - default 20
 */
export const usePagination = ({ initialPage = 1, initialLimit = 20 } = {}) => {
  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Accepts either a number or an updater fn, and clamps to [1, totalPages] —
  // matches the contract Pagination.jsx's onPageChange expects.
  const setPage = useCallback(
    (nextPage) => {
      setPageState((current) => {
        const requested = typeof nextPage === "function" ? nextPage(current) : nextPage;
        const upperBound = Math.max(totalPages, 1);
        return Math.min(Math.max(requested, 1), upperBound);
      });
    },
    [totalPages]
  );

  const nextPage = useCallback(() => setPage((current) => current + 1), [setPage]);
  const prevPage = useCallback(() => setPage((current) => current - 1), [setPage]);

  // Changing page size resets back to page 1, same as most Sunya list UIs.
  const setLimit = useCallback((nextLimit) => {
    setLimitState(nextLimit);
    setPageState(1);
  }, []);

  // Reconcile local state with the pagination object the API returned.
  const syncFromResponse = useCallback((meta) => {
    if (!meta) return;
    if (typeof meta.total === "number") setTotal(meta.total);
    if (typeof meta.totalPages === "number") setTotalPages(Math.max(meta.totalPages, 1));
    if (typeof meta.page === "number") setPageState(meta.page);
    if (typeof meta.limit === "number") setLimitState(meta.limit);
  }, []);

  const reset = useCallback(() => {
    setPageState(initialPage);
    setLimitState(initialLimit);
    setTotal(0);
    setTotalPages(1);
  }, [initialPage, initialLimit]);

  // Convenience object to spread straight into an api.list*() call.
  const queryParams = useMemo(() => ({ page, limit }), [page, limit]);

  return {
    page,
    limit,
    total,
    totalPages,
    queryParams,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    syncFromResponse,
    reset,
  };
};

export default usePagination;
