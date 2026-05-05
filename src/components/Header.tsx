"use client";

import GlyphButton from "@/components/GlyphButton";
import {
  usePrefersReducedMotion,
  useTheme,
  type Theme,
} from "@/providers/ThemeProvider";
import gsap from "gsap";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

type ThemeTransition = {
  outgoing: Theme;
  incoming: Theme;
};

function Header() {
  const t = useTranslations("Header");
  const { theme, toggleTheme, mounted } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentIconRef = useRef<HTMLSpanElement>(null);
  const previousIconRef = useRef<HTMLSpanElement>(null);
  const [iconTransition, setIconTransition] = useState<ThemeTransition | null>(
    null,
  );
  const isAnimatingThemeTransition =
    Boolean(iconTransition) && !prefersReducedMotion;
  const activeThemeTransition = isAnimatingThemeTransition
    ? iconTransition
    : null;

  useEffect(() => {
    if (!prefersReducedMotion) {
      return;
    }

    queueMicrotask(() => {
      setIconTransition(null);
    });
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (
      !isAnimatingThemeTransition ||
      !buttonRef.current ||
      !currentIconRef.current ||
      !previousIconRef.current
    ) {
      return;
    }

    const timeline = gsap.timeline({
      defaults: { duration: 0.15 },
      onComplete: () => {
        setIconTransition(null);
      },
    });

    const previousIcon = previousIconRef.current;
    const currentIcon = currentIconRef.current;

    if (!previousIcon || !currentIcon) {
      return;
    }

    gsap.set(previousIcon, { x: 0, autoAlpha: 1 });
    gsap.set(currentIcon, { x: -18, autoAlpha: 0 });

    timeline.to(previousIcon, { x: 18, autoAlpha: 0, ease: "back.in(1.25)" });
    timeline.to(currentIcon, {
      x: 0,
      autoAlpha: 1,
      ease: "elastic.out(1, 0.68)",
      duration: 0.4,
    });

    return () => {
      timeline.kill();
      gsap.set([previousIcon, currentIcon], {
        clearProps: "transform,opacity,visibility",
      });
    };
  }, [isAnimatingThemeTransition]);

  const isThemeResolved = mounted;
  const visibleTheme = isThemeResolved
    ? isAnimatingThemeTransition
      ? (iconTransition?.incoming ?? theme)
      : theme
    : null;
  const nextThemeLabel = visibleTheme
    ? visibleTheme === "dark"
      ? t("actions.switchToTheme", { theme: t("themes.light") })
      : t("actions.switchToTheme", { theme: t("themes.dark") })
    : t("actions.toggleTheme");

  const handleToggleTheme = () => {
    if (!visibleTheme) {
      return;
    }

    const nextTheme = visibleTheme === "dark" ? "light" : "dark";

    if (!prefersReducedMotion) {
      setIconTransition({ outgoing: visibleTheme, incoming: nextTheme });
    }

    toggleTheme();
  };

  return (
    <header className="relative z-20 flex items-center justify-between gap-4 py-3 sm:py-4">
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
            className="text-foreground-faint text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300 hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <GlyphButton
          ref={buttonRef}
          type="button"
          onClick={handleToggleTheme}
          disabled={!mounted}
          aria-label={nextThemeLabel}
          title={nextThemeLabel}
        >
          <span className="relative flex size-5 items-center justify-center overflow-hidden">
            {isAnimatingThemeTransition ? (
              <span
                ref={previousIconRef}
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center"
              >
                <ThemeGlyph theme={activeThemeTransition!.outgoing} />
              </span>
            ) : null}
            <span
              ref={currentIconRef}
              aria-hidden="true"
              style={
                isAnimatingThemeTransition
                  ? { opacity: 0, transform: "translateX(-18px)" }
                  : undefined
              }
              className="absolute inset-0 flex items-center justify-center"
            >
              {mounted && visibleTheme ? (
                <ThemeGlyph theme={visibleTheme} />
              ) : null}
            </span>
          </span>
        </GlyphButton>
      </div>
    </header>
  );
}

export default Header;
