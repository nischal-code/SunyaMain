import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useFetch
 *
 * Generic async data-fetching hook for the functions exported by
 * src/api/*.api.js (each returns an axios response promise). Unwraps
 * the API's standard envelope { success, message, data } so consumers
 * get the inner `data` payload directly.
 *
 * Usage (auto-fetch on mount / when deps change):
 *   const { data, isLoading, error, refetch } = useFetch(
 *     () => projectApi.listProjects({ page, limit }),
 *     [page, limit]
 *   );
 *
 * Usage (manual/lazy, e.g. inside a form submit handler):
 *   const { run, isLoading, error } = useFetch(userApi.updateUserRole, [], {
 *     immediate: false,
 *   });
 *   const onSubmit = (userId, role) => run(userId, role);
 *
 * @param {Function} apiFn - (...args) => Promise<AxiosResponse>
 * @param {Array} deps - dependency array; auto-fetch re-runs when these change
 * @param {Object} options
 * @param {boolean} options.immediate - fetch automatically on mount/deps change (default true)
 * @param {*} options.initialData - initial value for `data` (default null)
 */
export const useFetch = (apiFn, deps = [], options = {}) => {
  const { immediate = true, initialData = null } = options;

  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(immediate);

  // Keep the latest apiFn without forcing the effect below to
  // re-subscribe every render if the caller passes an inline arrow fn.
  const apiFnRef = useRef(apiFn);
  apiFnRef.current = apiFn;

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Guards against a slower, stale request overwriting the result of a
  // newer one when deps change quickly (e.g. fast typing into a filter).
  const requestIdRef = useRef(0);

  const run = useCallback((...args) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    return apiFnRef
      .current(...args)
      .then((response) => {
        const payload = response?.data?.data ?? response?.data ?? null;
        if (isMountedRef.current && requestId === requestIdRef.current) {
          setData(payload);
          setIsLoading(false);
        }
        return payload;
      })
      .catch((err) => {
        if (isMountedRef.current && requestId === requestIdRef.current) {
          setError(err);
          setIsLoading(false);
        }
        throw err;
      });
  }, []);

  useEffect(() => {
    if (!immediate) return;
    run().catch(() => {
      // Already captured in `error` state via run(); swallow here so it
      // doesn't also surface as an unhandled promise rejection.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, immediate]);

  return { data, error, isLoading, refetch: run, run, setData };
};

export default useFetch;
