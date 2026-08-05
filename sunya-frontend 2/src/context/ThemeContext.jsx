import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getItem, setItem } from "../utils/storage";
import { STORAGE_KEYS } from "../utils/constants";

/**
 * ThemeContext
 * App-wide light/dark theme toggle. Persists the choice to localStorage
 * and applies it as `data-theme="dark"` on <html>, which index.css uses
 * to swap the --color-* custom properties consumed across the app.
 */
const ThemeContext = createContext(null);

const getPreferredTheme = () => {
  const stored = getItem(STORAGE_KEYS.THEME);
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, isDark: theme === "dark", setTheme, toggleTheme }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return context;
};

export default ThemeContext;
