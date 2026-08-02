import { useEffect, useState } from "react";

/**
 * useDebounce
 *
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * have passed without `value` changing. Use it to avoid firing an API
 * call (e.g. via useFetch) on every keystroke in a search/filter input.
 *
 * Usage:
 *   const [search, setSearch] = useState("");
 *   const debouncedSearch = useDebounce(search, 400);
 *
 *   const { data } = useFetch(
 *     () => userApi.listUsers({ search: debouncedSearch }),
 *     [debouncedSearch]
 *   );
 *
 * @param {*} value - the fast-changing value to debounce
 * @param {number} delay - debounce delay in ms (default 400)
 * @returns {*} the debounced value
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
