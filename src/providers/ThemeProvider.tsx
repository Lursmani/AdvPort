"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

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

function useReducedMotionState() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMotionPreference);

      return () => {
        mediaQuery.removeEventListener("change", updateMotionPreference);
      };
    }

    mediaQuery.addListener(updateMotionPreference);

    return () => {
      mediaQuery.removeListener(updateMotionPreference);
    };
  }, []);

  return prefersReducedMotion;
}

function ReducedMotionProvider({ children }: ThemeProviderProps) {
  const prefersReducedMotion = useReducedMotionState();

  return (
    <ReducedMotionContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark"]}
    >
      <ReducedMotionProvider>{children}</ReducedMotionProvider>
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
