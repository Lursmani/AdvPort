"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME,
  parseTheme,
  THEME_COOKIE_MAX_AGE,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeListeners = new Set<() => void>();

function getClientTheme(): Theme {
  const documentTheme = parseTheme(document.documentElement.dataset.theme);

  if (documentTheme) {
    return documentTheme;
  }

  const storedTheme = parseTheme(
    window.localStorage.getItem(THEME_STORAGE_KEY),
  );

  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : DEFAULT_THEME;
}

function persistTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.cookie = `${THEME_STORAGE_KEY}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function notifyThemeListeners() {
  themeListeners.forEach((listener) => {
    listener();
  });
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) {
      return;
    }

    const nextTheme = parseTheme(event.newValue);

    if (!nextTheme) {
      return;
    }

    document.documentElement.dataset.theme = nextTheme;
    listener();
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    themeListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme?: Theme;
};

function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getClientTheme,
    () => initialTheme ?? DEFAULT_THEME,
  );

  useEffect(() => {
    if (!initialTheme && theme !== getClientTheme()) {
      return;
    }

    persistTheme(theme);
  }, [initialTheme, theme]);

  const setTheme = (nextTheme: Theme) => {
    persistTheme(nextTheme);
    notifyThemeListeners();
  };

  const value = {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

export default ThemeProvider;
