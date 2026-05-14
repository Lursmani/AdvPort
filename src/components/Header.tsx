"use client";

import GlyphButton from "@/components/GlyphButton";
import { AnimatePresence, motion } from "framer-motion";
import {
  usePrefersReducedMotion,
  useTheme,
  type Theme,
} from "@/providers/ThemeProvider";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navLinks = [
  { href: "#top", key: "top" },
  { href: "#skills", key: "skills" },
  { href: "#experience", key: "experience" },
  { href: "#about", key: "about" },
] as const;

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

const DRAWER_ENTER_TRANSITION = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.9,
} as const;

const DRAWER_EXIT_TRANSITION = {
  duration: 0.18,
  ease: [0.4, 0, 1, 1],
} as const;

function Header() {
  const t = useTranslations("Header");
  const { theme, toggleTheme, mounted } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isScrolledPastThreshold, setIsScrolledPastThreshold] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDrawerOpen]);

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

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <header className="site-header pointer-events-none fixed inset-x-0 top-0 z-50 transition-[opacity,transform] duration-300">
      <div
        className={`header-shell my-2 pointer-events-auto mx-auto flex w-[calc(100%-1rem)] max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-2 sm:w-[calc(100%-1.5rem)] sm:px-6 sm:py-2 lg:px-8 ${
          isScrolledPastThreshold ? "header-shell--active" : ""
        }`}
      >
        <Link
          href="#top"
          className="text-foreground-soft text-sm font-semibold uppercase tracking-[0.24em] transition-colors duration-300 hover:text-foreground"
          onClick={closeDrawer}
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
              {t(`nav.${link.key}`)}
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

          <GlyphButton
            type="button"
            className="md:hidden"
            onClick={() => {
              setIsDrawerOpen(true);
            }}
            aria-label={t("actions.openMenu")}
            aria-controls="mobile-site-nav"
            aria-expanded={isDrawerOpen}
          >
            <Menu className="size-[1.15rem]" strokeWidth={1.85} />
          </GlyphButton>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen ? (
          <>
            <motion.button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-auto fixed inset-0 z-40 border-0 bg-[color-mix(in_oklab,var(--background)_58%,transparent)] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }
              }
              onClick={closeDrawer}
            />

            <motion.aside
              id="mobile-site-nav"
              className="hero-glass pointer-events-auto fixed inset-y-0 left-0 z-50 flex w-[min(22rem,84vw)] flex-col gap-8 rounded-r-[2rem] px-5 py-5 md:hidden"
              initial={
                prefersReducedMotion ? { x: 0, opacity: 1 } : { x: "-100%" }
              }
              animate={{
                x: 0,
                transition: prefersReducedMotion
                  ? { duration: 0 }
                  : DRAWER_ENTER_TRANSITION,
              }}
              exit={{
                x: prefersReducedMotion ? 0 : "-100%",
                transition: prefersReducedMotion
                  ? { duration: 0 }
                  : DRAWER_EXIT_TRANSITION,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="#top"
                  className="text-foreground-soft text-sm font-semibold uppercase tracking-[0.24em] transition-colors duration-300 hover:text-foreground"
                  onClick={closeDrawer}
                >
                  DL
                </Link>

                <GlyphButton
                  type="button"
                  onClick={closeDrawer}
                  aria-label={t("actions.closeMenu")}
                >
                  <X className="size-[1.15rem]" strokeWidth={1.85} />
                </GlyphButton>
              </div>

              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hero-glass rounded-[1.4rem] px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground-soft transition-colors duration-300 hover:text-foreground"
                    onClick={closeDrawer}
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export default Header;
