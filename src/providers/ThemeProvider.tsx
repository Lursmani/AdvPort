"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "@teispace/next-themes";
import { themeBackgroundColors } from "@/app/site";
import MotionProvider from "./MotionProvider";

export type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: ReactNode;
};

type ReducedMotionContextValue = {
  prefersReducedMotion: boolean;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ReducedMotionContext = createContext<ReducedMotionContextValue>({
  prefersReducedMotion: false,
});

function noopSubscribe() {
  return () => {};
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let reducedMotionMediaQuery: MediaQueryList | null = null;

function getReducedMotionMediaQuery() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }

  if (!reducedMotionMediaQuery) {
    reducedMotionMediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  }

  return reducedMotionMediaQuery;
}

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mediaQuery = getReducedMotionMediaQuery();

  if (!mediaQuery) {
    return () => {};
  }

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onStoreChange);

    return () => {
      mediaQuery.removeEventListener("change", onStoreChange);
    };
  }

  mediaQuery.addListener(onStoreChange);

  return () => {
    mediaQuery.removeListener(onStoreChange);
  };
}

function getReducedMotionSnapshot() {
  return getReducedMotionMediaQuery()?.matches ?? false;
}

function getReducedMotionServerSnapshot() {
  return false;
}

// Read the preference synchronously via useSyncExternalStore. The server
// snapshot is always false (matching SSR), and React re-renders after hydration
// if the client snapshot differs, so this is hydration-safe without an effect.
// Reading synchronously lets consumers gate on the true value from the first
// client render — e.g. the hero scene is never mounted for reduced-motion users.
function useReducedMotionState() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

function ReducedMotionProvider({ children }: ThemeProviderProps) {
  const prefersReducedMotion = useReducedMotionState();

  return (
    <ReducedMotionContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

// The static <meta name="theme-color"> tags rendered by the layout's viewport
// export only track the OS color scheme, while next-themes lets the user
// override the theme independently of it. Keep the browser chrome in sync with
// the resolved theme by rewriting both tags whenever it changes.
function ThemeColorSync() {
  const { resolvedTheme } = useNextTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") {
      return;
    }

    const color = themeBackgroundColors[resolvedTheme];

    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        meta.setAttribute("content", color);
      });
  }, [resolvedTheme]);

  return null;
}

function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark"]}
    >
      <ThemeColorSync />
      <ReducedMotionProvider>
        <MotionProvider>{children}</MotionProvider>
      </ReducedMotionProvider>
    </NextThemesProvider>
  );
}

export function usePrefersReducedMotion() {
  return useContext(ReducedMotionContext).prefersReducedMotion;
}

export function useTheme(): ThemeContextValue {
  const { resolvedTheme, setTheme } = useNextTheme();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const theme: Theme = resolvedTheme === "light" ? "light" : "dark";

  return {
    theme,
    setTheme: (nextTheme) => setTheme(nextTheme),
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    mounted,
  };
}

export default ThemeProvider;
