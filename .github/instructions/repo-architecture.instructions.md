---
description: "Use when creating a new localized page, planning route structure, or making structural App Router changes in AdvPort. Covers locale-prefixed routing, server/client boundaries, and canonical section composition."
---

# AdvPort Repository Architecture

- Localized route work belongs under `src/app/[locale]/...` unless a non-localized route is intentional.
- `src/app/[locale]/layout.tsx` is the canonical locale boundary.
- Preserve awaited locale validation, `setRequestLocale(locale)`, and `generateStaticParams()`.
- Keep page route files thin and move interactive logic into components under `src/components/`.
- Reuse `ViewportSection` and `Reveal` before inventing new section primitives.
- Read `docs/ai/new-page.md` before adding a new route or major page section.
