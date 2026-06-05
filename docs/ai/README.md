# AI Implementation Playbooks

This folder is the shared AI-facing source of truth for `AdvPort`.

Use these playbooks before making structural, styling, routing, motion, or accessibility changes. They are written to be reusable by GitHub Copilot, Claude, Codex, and human contributors.

## Start Here

- Read `../../AGENTS.md` for repository-wide always-on rules.
- Read the task-specific playbook below before implementing changes.
- When repo-specific patterns repeat, update these docs first and then summarize them in `.github/instructions/` or `.github/skills/`.

## Playbooks

- `new-page.md` — create a new localized page or section using the repo’s App Router, i18n, and section patterns.
- `styling-and-tailwind.md` — use Tailwind v4, SCSS modules, tokens, breakpoints, and `cn()` correctly.
- `translations-and-routing.md` — work with `next-intl`, locale routing, `generateStaticParams()`, and synchronized message catalogs.
- `experience-entry.md` — add or update projects in the experience section.
- `motion-theme-and-hydration.md` — implement animation, reduced-motion support, theme-safe behavior, and hydration-safe responsiveness.
- `modal-and-header-a11y.md` — implement drawers, modals, focus restoration, inert regions, and scroll locking.
- `hero-scene.md` — work safely in the Three.js hero scene.

## Canonical References

- `src/app/layout.tsx`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/globals.scss`
- `src/styles/_breakpoints.scss`
- `src/i18n/config.ts`
- `src/i18n/routing.ts`
- `src/i18n/request.ts`
- `src/components/ViewportSection.tsx`
- `src/components/Reveal.tsx`
- `src/components/skills/SkillsSection.tsx`
- `src/components/skills/SkillCard.tsx`
- `src/components/Header.tsx`
- `src/components/LanguageSwitcher.tsx`
- `src/components/LanguageSwitcherUtils.ts`
- `src/components/experience/experience-data.ts`
- `src/components/experience/ExperienceCarousel.tsx`
- `src/components/experience/ExperienceModal.tsx`
- `tests/translations-sync.test.ts`

## Maintenance Rule

If a bug or implementation mistake happens more than once, promote the fix into one of these playbooks. Keep long-form guidance here and keep `.github/` assets shorter and more discoverable.
