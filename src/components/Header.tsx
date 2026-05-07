"use client";

import GlyphButton from "@/components/GlyphButton";
import { AnimatePresence, motion } from "framer-motion";
import {
  usePrefersReducedMotion,
  useTheme,
  type Theme,
} from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navLinks = [
  { href: "#top", label: "Item 1" },
  { href: "#details", label: "Item 2" },
  { href: "#process", label: "Item 3" },
];

function ThemeGlyph({ theme }: { theme: Theme }) {
  if (theme === "light") {
    return <Sun className="size-[1.15rem]" strokeWidth={1.85} />;
  }

  return <Moon className="size-[1.15rem]" strokeWidth={1.85} />;
}

const THEME_ICON_ENTER_TRANSITION = {
  type: "spring",
  stiffness: 520,
  damping: 28,
  mass: 0.85,
} as const;

const THEME_ICON_EXIT_TRANSITION = {
  duration: 0.15,
  ease: [0.55, 0.055, 0.675, 0.19],
} as const;

function Header() {
  const t = useTranslations("Header");
  const { theme, toggleTheme, mounted } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isScrolledPastThreshold, setIsScrolledPastThreshold] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      setIsScrolledPastThreshold(window.scrollY > 200);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  const isThemeResolved = mounted;
  const visibleTheme = isThemeResolved ? theme : null;
  const nextThemeLabel = visibleTheme
    ? visibleTheme === "dark"
      ? t("actions.switchToTheme", { theme: t("themes.light") })
      : t("actions.switchToTheme", { theme: t("themes.dark") })
    : t("actions.toggleTheme");

  const handleToggleTheme = () => {
    if (!visibleTheme) {
      return;
    }

    toggleTheme();
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        className={`header-shell my-2 pointer-events-auto mx-auto flex w-[calc(100%-1rem)] max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-2 sm:w-[calc(100%-1.5rem)] sm:px-6 sm:py-2 lg:px-8 ${
          isScrolledPastThreshold ? "header-shell--active" : ""
        }`}
      >
        <Link
          href="#top"
          className="text-foreground-soft text-sm font-semibold uppercase tracking-[0.24em] transition-colors duration-300 hover:text-foreground"
        >
          DL
        </Link>
        <nav className="hero-glass hidden items-center gap-6 rounded-full px-5 py-3 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground-muted text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <GlyphButton
            type="button"
            onClick={handleToggleTheme}
            disabled={!mounted}
            aria-label={nextThemeLabel}
            title={nextThemeLabel}
          >
            <span className="relative flex size-5 items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} mode="sync">
                {mounted && visibleTheme ? (
                  <motion.span
                    key={visibleTheme}
                    aria-hidden="true"
                    initial={
                      prefersReducedMotion
                        ? { x: 0, opacity: 1 }
                        : { x: -18, opacity: 0 }
                    }
                    animate={{
                      x: 0,
                      opacity: 1,
                      transition: prefersReducedMotion
                        ? { duration: 0 }
                        : THEME_ICON_ENTER_TRANSITION,
                    }}
                    exit={{
                      x: prefersReducedMotion ? 0 : 18,
                      opacity: 0,
                      transition: prefersReducedMotion
                        ? { duration: 0 }
                        : THEME_ICON_EXIT_TRANSITION,
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <ThemeGlyph theme={visibleTheme} />
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </span>
          </GlyphButton>
        </div>
      </div>
    </header>
  );
}

export default Header;
