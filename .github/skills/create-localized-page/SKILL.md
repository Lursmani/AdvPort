---
name: create-localized-page
description: "Create a new localized page or major route section in AdvPort. Use for new App Router pages, locale-prefixed routes, page structure planning, section composition, and synchronized translation updates."
argument-hint: "Describe the page route, purpose, and required sections"
---

# Create a Localized Page

Use this skill when adding a new page under `src/app/[locale]/...` or when planning a major new route-level section.

## Procedure

1. Read `docs/ai/new-page.md`.
2. Confirm the route belongs under `src/app/[locale]/...`.
3. Keep the page file thin and compose reusable UI from `src/components/...`.
4. Reuse `ViewportSection` and `Reveal` before creating new layout primitives.
5. Add all user-facing strings to `messages/en.json`, `messages/nl.json`, and `messages/ka.json` with identical object shape.
6. If header navigation is affected, preserve existing locale-aware and accessibility behavior.
7. Validate translation shape using `tests/translations-sync.test.ts` expectations.

## Canonical References

- `docs/ai/new-page.md`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/page.tsx`
- `src/components/ViewportSection.tsx`
- `src/components/Reveal.tsx`
- `src/components/skills/SkillsSection.tsx`
- `tests/translations-sync.test.ts`
