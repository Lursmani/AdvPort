"use client";

import { useTheme } from "@/components/ThemeProvider";

function Header() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <header className="flex items-center justify-between gap-4 rounded-3xl border border-foreground/10 bg-primary px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur-md">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-foreground/70">
          AdvPort
        </p>
        <p className="mt-1 text-lg font-semibold text-foreground">
          Theme controls
        </p>
      </div>

      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={toggleTheme}
        suppressHydrationWarning
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gradient-start to-gradient-end px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 hover:-translate-y-0.5"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-gradient-start to-gradient-end" />
        Switch to {nextTheme} mode
      </button>
    </header>
  );
}

export default Header;
