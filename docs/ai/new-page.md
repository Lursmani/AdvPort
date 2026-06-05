# Creating a New Localized Page

Use this guide when adding a new route or a major new section in `AdvPort`.

## Route Model

This app uses the Next.js App Router with locale-prefixed routes.

- Root redirect lives in `src/app/page.tsx`.
- Localized pages live under `src/app/[locale]/...`.
- `src/app/[locale]/layout.tsx` validates awaited `params.locale`, calls `setRequestLocale(locale)`, and exports `generateStaticParams()`.
- Locale prefix is always required because `src/i18n/routing.ts` sets `localePrefix: "always"`.

## Default Pattern

For a new page like `/{locale}/projects`:

```text
src/app/[locale]/projects/page.tsx
src/components/projects/
messages/en.json
messages/nl.json
messages/ka.json
```

Create a route file only under `src/app/[locale]/...`. Do not create parallel non-localized page trees unless you intentionally want a non-localized route.

## Server and Client Boundaries

Prefer server components by default.

- Page and layout files can stay server components unless they need browser APIs, state, animations, or event handlers.
- Interactive sections should usually be client components in `src/components/...`.
- Keep route files thin and compose reusable sections from `src/components`.

## Section Composition Pattern

The canonical section pattern is:

1. Wrap with `ViewportSection` for consistent section sizing, width, and horizontal clipping.
2. Use `Reveal` for entrance animation when the content should animate into view.
3. Use `useTranslations("SectionName")` inside client components or `getTranslations` patterns if you later adopt server-side message reads.
4. Reuse existing spacing, typography, and accent patterns from `SkillsSection` and `ExperienceSection`.

Reference files:

- `src/components/ViewportSection.tsx`
- `src/components/Reveal.tsx`
- `src/components/skills/SkillsSection.tsx`
- `src/components/experience/ExperienceSection.tsx`

## i18n Requirements

Every new user-facing string must be added across all locale files:

- `messages/en.json`
- `messages/nl.json`
- `messages/ka.json`

Keep the object shape identical across catalogs. `tests/translations-sync.test.ts` compares all locale files and fails on:

- missing keys
- extra keys
- type mismatches

Organize strings under a stable top-level namespace such as `ProjectsPage` or `ProjectsSection`.

## Navigation and Header Implications

If the new page should be reachable from the header, update header navigation deliberately.

Current header navigation is anchor-based on the home page. If you introduce a true route-level page:

- decide whether the header keeps anchor links, route links, or both
- preserve locale-aware navigation behavior
- preserve focus and drawer behavior on mobile

Reference: `src/components/Header.tsx`

## Styling Expectations

Use the repo styling conventions:

- Tailwind utilities for layout, spacing, typography, and responsive composition
- `.module.scss` only for complex component-scoped visual systems, layered effects, masks, or styles that become awkward in utilities
- `cn()` for class merging
- shared theme tokens from `src/app/globals.scss`

Read `styling-and-tailwind.md` before implementing page-specific styles.

## Validation Checklist

Before finishing:

1. Confirm the route is only defined in `src/app/[locale]/...`.
2. Confirm any new page keeps locale handling compatible with `src/app/[locale]/layout.tsx`.
3. Confirm new translations exist in all locale files with identical shape.
4. Confirm section layout reuses repo patterns instead of inventing a new spacing system.
5. Confirm interactive pieces are client components only where necessary.
6. Run translation validation if message files changed.

## Common Mistakes

- Creating a page outside `src/app/[locale]/...` and bypassing locale routing.
- Forgetting to update all message catalogs.
- Mixing large client-only logic directly into the page route instead of a reusable component.
- Recreating section layout primitives instead of using `ViewportSection` and `Reveal`.
- Introducing route navigation without considering the header’s current anchor-navigation model.
