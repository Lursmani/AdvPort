"use client";

import { useTheme, type Theme } from "@/providers/ThemeProvider";
import gsap from "gsap";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const { theme, toggleTheme, mounted } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentIconRef = useRef<HTMLSpanElement>(null);
  const previousIconRef = useRef<HTMLSpanElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [iconTransition, setIconTransition] = useState<ThemeTransition | null>(
    null,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      const reduceMotion = mediaQuery.matches;

      setPrefersReducedMotion(reduceMotion);

      if (reduceMotion) {
        setIconTransition(null);
      }
    };

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

  useEffect(() => {
    if (
      !iconTransition ||
      !buttonRef.current ||
      !currentIconRef.current ||
      !previousIconRef.current
    ) {
      return;
    }

    if (prefersReducedMotion) {
      return;
    }

    const timeline = gsap.timeline({
      defaults: { duration: 0.52 },
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
      duration: 0.7,
    });

    return () => {
      timeline.kill();
      gsap.set([previousIcon, currentIcon], {
        clearProps: "transform,opacity,visibility",
      });
    };
  }, [iconTransition, prefersReducedMotion]);

  const isThemeResolved = mounted;
  const visibleTheme = isThemeResolved
    ? (iconTransition?.incoming ?? theme)
    : null;

  const nextThemeLabel = visibleTheme
    ? visibleTheme === "dark"
      ? "Switch to light theme"
      : "Switch to dark theme"
    : "Toggle theme";

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
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleTheme}
        disabled={!mounted}
        aria-label={"Toggle theme"}
        title={nextThemeLabel}
        className="hero-glass inline-flex size-11 items-center justify-center rounded-full text-foreground-muted transition duration-300 hover:-translate-y-0.5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="relative flex size-5 items-center justify-center overflow-hidden">
          {iconTransition ? (
            <span
              ref={previousIconRef}
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center"
            >
              <ThemeGlyph theme={iconTransition.outgoing} />
            </span>
          ) : null}
          <span
            ref={currentIconRef}
            aria-hidden="true"
            style={
              iconTransition
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
      </button>
    </header>
  );
}

export default Header;
