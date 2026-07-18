"use client";

import GlyphButton from "@/components/GlyphButton";
import { AnimatePresence, m as motion } from "framer-motion";
import {
  usePrefersReducedMotion,
  useTheme,
  type Theme,
} from "@/providers/ThemeProvider";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { handleHeaderFocus } from "./header/util";

const navLinks = [
  { href: "#top", key: "top" },
  { href: "#skills", key: "skills" },
  { href: "#experience", key: "experience" },
  { href: "#contact", key: "contact" },
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
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }

    return document.documentElement.dataset.experienceModalOpen === "true";
  });
  const headerShellRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const openDrawerButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeDrawerButtonRef = useRef<HTMLButtonElement | null>(null);
  const shouldRestoreFocusRef = useRef(true);
  const drawerTitleId = useId();

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
    const root = document.documentElement;
    const syncModalState = () => {
      const isModalOpen = root.dataset.experienceModalOpen === "true";

      setIsExperienceModalOpen(isModalOpen);

      if (isModalOpen) {
        shouldRestoreFocusRef.current = false;
        setIsDrawerOpen(false);
      }
    };

    const observer = new MutationObserver(syncModalState);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-experience-modal-open"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    return handleHeaderFocus({
      isDrawerOpen,
      headerShellRef,
      openDrawerButtonRef,
      closeDrawerButtonRef,
      drawerRef,
      shouldRestoreFocusRef,
      setIsDrawerOpen,
    });
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

  const openDrawer = () => {
    if (isExperienceModalOpen) {
      return;
    }

    shouldRestoreFocusRef.current = true;
    setIsDrawerOpen(true);
  };

  const closeDrawer = (restoreFocus = true) => {
    shouldRestoreFocusRef.current = restoreFocus;
    setIsDrawerOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pointer-events-none transition-transform duration-300 ${
        isExperienceModalOpen
          ? "-translate-y-[calc(100%+1.25rem)]"
          : "translate-y-0"
      }`}
      aria-hidden={isExperienceModalOpen ? true : undefined}
      inert={isExperienceModalOpen ? true : undefined}
    >
      <div
        ref={headerShellRef}
        className={`header-shell my-2 pointer-events-auto mx-auto flex w-[calc(100%-1rem)] max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-2 sm:w-[calc(100%-1.5rem)] sm:px-6 sm:py-2 lg:px-8 ${
          isScrolledPastThreshold ? "header-shell--active" : ""
        }`}
      >
        <Link
          href="#top"
          className="text-foreground-soft text-sm font-semibold uppercase tracking-eyebrow transition-colors duration-300 hover:text-foreground"
          onClick={() => {
            closeDrawer(false);
          }}
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
            ref={openDrawerButtonRef}
            className="md:hidden!"
            onClick={openDrawer}
            aria-label={t("actions.openMenu")}
            aria-controls="mobile-site-nav"
            aria-expanded={isDrawerOpen}
            aria-haspopup="dialog"
          >
            <Menu className="size-[1.15rem]" strokeWidth={1.85} />
          </GlyphButton>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen ? (
          <>
            <motion.div
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-auto fixed inset-0 z-40 border-0 bg-[color-mix(in_oklab,var(--background)_58%,transparent)] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }
              }
              onClick={() => {
                closeDrawer();
              }}
            />

            <motion.aside
              id="mobile-site-nav"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={drawerTitleId}
              tabIndex={-1}
              className="hero-glass pointer-events-auto fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(22rem,84vw)] flex-col gap-8 rounded-r-4xl px-5 py-5 md:hidden"
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
              <h2 id={drawerTitleId} className="sr-only">
                {t("labels.mobileNavigation")}
              </h2>

              <div className="flex items-center justify-between gap-3">
                <Link
                  href="#top"
                  className="text-foreground-soft text-sm font-semibold uppercase tracking-eyebrow transition-colors duration-300 hover:text-foreground"
                  onClick={() => {
                    closeDrawer(false);
                  }}
                >
                  DL
                </Link>

                <GlyphButton
                  ref={closeDrawerButtonRef}
                  type="button"
                  onClick={() => {
                    closeDrawer();
                  }}
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
                    onClick={() => {
                      closeDrawer(false);
                    }}
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
