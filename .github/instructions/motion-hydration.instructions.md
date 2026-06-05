---
description: "Use when adding or changing animation, theme behavior, reduced-motion handling, or hydration-sensitive responsive UI in AdvPort. Covers Framer Motion, next-themes, and SSR-safe responsive patterns."
applyTo:
  ["src/components/**/*.tsx", "src/providers/**/*.tsx", "src/app/layout.tsx"]
---

# AdvPort Motion and Hydration Guidance

- Respect `prefers-reduced-motion` through `src/providers/ThemeProvider.tsx` and existing motion patterns.
- Keep theme resolution client-authoritative; avoid `cookies()` or `headers()` in `src/app/layout.tsx` unless dynamic rendering is intentional.
- Prefer CSS or CSS-variable-driven responsive behavior for layout-critical transforms to avoid hydration mismatch.
- Keep Framer Motion transforms and Tailwind translate utilities on separate elements.
- Gate heavy client-only visuals appropriately.
- Read `docs/ai/motion-theme-and-hydration.md` before non-trivial motion or theme changes.
