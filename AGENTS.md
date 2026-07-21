<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AdvPort AI Working Agreement

## Project Stack

- Next.js `16.2.4` App Router
- React `19`
- `next-intl` locale routing
- `next-themes` theme switching
- Tailwind CSS `v4`
- Sass / SCSS Modules
- Framer Motion
- React Three Fiber / `three`
- Vitest

## Canonical References

Read these files before making structural changes:

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
- `docs/ai/README.md`

## Routing and i18n Rules

- Locale-prefixed routes are required. Keep route work under `src/app/[locale]/...` unless a non-localized route is intentional.
- `src/app/[locale]/layout.tsx` is the locale boundary and should validate awaited `params.locale`, call `setRequestLocale(locale)`, and export `generateStaticParams()`.
- `src/i18n/routing.ts` uses `localePrefix: "always"`; do not bypass that accidentally.
- Keep `messages/en.json`, `messages/nl.json`, and `messages/ka.json` structurally synchronized.
- If message catalogs change, use `tests/translations-sync.test.ts` as the validation reference.
- Preserve query-string and hash-fragment behavior in locale switching; `src/components/LanguageSwitcherUtils.ts` and `src/components/LanguageSwitcher.tsx` are the canonical implementations.

## Styling Rules

- Prefer Tailwind utilities for layout, spacing, typography, and responsive composition.
- Use `.module.scss` for complex component-local visual systems, layered effects, masks, pseudo-elements, or styles driven by local CSS variables.
- Treat `src/app/globals.scss` as the theme-token source of truth.
- Treat `src/styles/_breakpoints.scss` as the single breakpoint scale for both SCSS and Tailwind.
- Use `src/utils/cn.ts` when composing Tailwind classes with CSS module classes.
- The `@theme` warning in editor CSS diagnostics is a known Tailwind v4 false positive unless the actual build fails.

## Motion and Theme Rules

- Respect `prefers-reduced-motion` via `src/providers/ThemeProvider.tsx` and existing motion patterns.
- Do not put Framer Motion transform animation and Tailwind translate utilities on the same element; use the outer-wrapper/nested-child pattern from `src/components/skills/SkillCard.tsx`.
- Theme should remain client-authoritative. Avoid `cookies()` or `headers()` in `src/app/layout.tsx` unless dynamic rendering is intentional.
- Prefer CSS or CSS-variable-driven responsive behavior for layout-critical transforms to avoid hydration mismatch.

## Accessibility and Overlay Rules

- Reuse the established drawer/modal patterns instead of inventing new ones.
- Preserve focus restoration, inert background handling, keyboard escape behavior, and scroll-lock cleanup.
- `src/utils/overlayFocus.ts` (`trapOverlayFocus`) implements the shared overlay contract; new overlays must call it instead of re-rolling trap/inert/scroll-lock/restore logic.
- `src/components/header/util.ts`, `src/components/experience/ExperienceCarousel.tsx`, and `src/components/experience/ExperienceModal.tsx` are the canonical overlay references.

## Hero Scene Rules

- The hero scene is performance-sensitive and client-only.
- Read `docs/hero-animation.md` and `docs/ai/hero-scene.md` before changing the hero architecture.
- Preserve reduced-motion gating, visibility gating, palette switching, and geometry cleanup.

## Guidance Hierarchy

- `AGENTS.md` = always-on repo contract
- `docs/ai/` = shared long-form implementation playbooks for Copilot, Claude, Codex, and humans
- `.github/instructions/` = concise task/file-scoped guidance for Copilot discovery
- `.github/skills/` = reusable on-demand workflows
- `.github/prompts/` = lightweight task entrypoints
- `.github/agents/` = narrow specialist agents when prompts/skills are not enough

## Maintenance Rule

- If a repo-specific mistake repeats, update `docs/ai/` first, then summarize it in instructions or skills if needed.
- Prefer linking to shared references over duplicating large blocks of guidance in multiple files.
