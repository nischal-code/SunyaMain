/**
 * storage.js
 * Thin, safe wrapper around window.localStorage. Falls back to an
 * in-memory Map when localStorage is unavailable (e.g. private-mode
 * edge cases or SSR-like tooling), so callers never need to guard
 * every access with a try/catch of their own.
 */

const memoryFallback = new Map();

const isStorageAvailable = () => {
  try {
    const testKey = "__sunya_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const available = typeof window !== "undefined" && isStorageAvailable();

export const getItem = (key, fallback = null) => {
  try {
    if (!available) return memoryFallback.has(key) ? memoryFallback.get(key) : fallback;
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : raw;
  } catch {
    return fallback;
  }
};

export const setItem = (key, value) => {
  try {
    if (!available) {
      memoryFallback.set(key, value);
      return;
    }
    window.localStorage.setItem(key, value);
  } catch {
    memoryFallback.set(key, value);
  }
};

export const removeItem = (key) => {
  try {
    if (!available) {
      memoryFallback.delete(key);
      return;
    }
    window.localStorage.removeItem(key);
  } catch {
    memoryFallback.delete(key);
  }
};

export const getJSON = (key, fallback = null) => {
  const raw = getItem(key, null);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const setJSON = (key, value) => setItem(key, JSON.stringify(value));

export default { getItem, setItem, removeItem, getJSON, setJSON };
