"use client";

import { useTheme } from "@/providers/ThemeProvider";
import Link from "next/link";

const navLinks = [
  { href: "#top", label: "Overview" },
  { href: "#details", label: "Layers" },
  { href: "#process", label: "Guardrails" },
];

function Header() {
  const { toggleTheme } = useTheme();

  return (
    <header className="relative z-20 flex items-center justify-between gap-4 py-3 sm:py-4">
      <Link
        href="#top"
        className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/88 transition duration-300 hover:text-foreground"
      >
        DL
      </Link>
      <nav className="hero-glass hidden items-center gap-6 rounded-full px-5 py-3 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/64 transition duration-300 hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={toggleTheme}
        className="hero-glass inline-flex items-center rounded-full px-4 py-3 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-foreground/72 transition duration-300 hover:-translate-y-0.5 hover:text-foreground"
      >
        Toggle Theme
      </button>
    </header>
  );
}

export default Header;
