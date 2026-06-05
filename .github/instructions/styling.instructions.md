---
description: "Use when styling a component with Tailwind v4, SCSS modules, theme tokens, or shared breakpoints in AdvPort. Covers when to use utilities vs CSS modules and how to compose classes safely."
applyTo: "src/**/*.{ts,tsx,scss}"
---

# AdvPort Styling Guidance

- Prefer Tailwind utilities for layout, spacing, typography, sizing, and responsive composition.
- Use `.module.scss` for complex component-local effects, pseudo-elements, masks, layered gradients, or CSS-variable-driven visuals.
- Treat `src/app/globals.scss` as the theme-token source of truth.
- Treat `src/styles/_breakpoints.scss` as the only breakpoint scale for SCSS and Tailwind.
- Use `src/utils/cn.ts` when combining CSS module classes, conditional utilities, and incoming `className` props.
- Do not put Framer Motion transform animation and Tailwind translate utilities on the same element.
- Read `docs/ai/styling-and-tailwind.md` before non-trivial styling work.
