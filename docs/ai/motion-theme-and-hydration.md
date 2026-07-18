# Motion, Theme, and Hydration Safety

Use this guide when editing animation, theme behavior, or viewport-responsive interactive UI.

## Reduced Motion

The repo exposes reduced-motion state through `src/providers/ThemeProvider.tsx`.

Use `usePrefersReducedMotion()` when animation should:

- disable entirely
- switch to zero-duration transitions
- avoid unnecessary scene mounting or motion work

Examples:

- `src/components/Reveal.tsx`
- `src/components/skills/SkillCard.tsx`
- `src/components/hero/HeroBanner.tsx`
- `src/components/experience/ExperienceModal.tsx`

## Theme Model

Theme is client-authoritative through the native theme store
(`src/providers/theme-store.ts`), exposed via `src/providers/ThemeProvider.tsx`.

Important rules:

- do not move theme resolution into request-time APIs in `src/app/layout.tsx`
- avoid `cookies()` or `headers()` in root layout unless dynamic rendering is intentional
- prefer CSS variables from `src/app/globals.scss` for theme-sensitive UI

The app should remain compatible with static prerendering.

## Hydration-Safe Responsiveness

Be careful when responsive behavior changes layout or transform values.

Preferred strategies in this repo:

- use CSS variables and media queries when responsive values affect layout during SSR/CSR handoff
- use client-only state when the behavior is purely interactive and safe after mount

Avoid patterns that render one layout on the server and a visibly different one on the client before hydration settles.

## Framer Motion Rules

This repo uses Framer Motion for entrance and overlay transitions.

Key rules:

- do not combine Framer Motion transform animation and Tailwind translate utilities on the same element
- import only `m` components (`import { m as motion } from "framer-motion"`); `LazyMotion` runs in `strict` mode in `src/providers/MotionProvider.tsx`, so rendering a full `motion` component throws in development and would otherwise defeat the lazy feature bundle

When both transform sources are needed:

- apply motion transforms to an outer wrapper
- apply static utility transforms to a nested child

Canonical reference: `src/components/skills/SkillCard.tsx`

### Overlay Motion and Expensive Paint Effects

Do not run expensive paint effects (`backdrop-filter`, large blurs/filters) on an
element while its rect is being animated with layout properties
(`top`/`left`/`width`/`height`) — the browser relayouts and re-runs the effect
every frame.

Pattern: fly the overlay with a cheap near-opaque background, then apply the
glass/blur treatment via a settled-state class once the enter animation
completes, and remove it again when the exit begins (`useIsPresent`).

Canonical reference: `src/components/experience/ExperienceModal.tsx`
(`isSettled` + `.modalPanelSettled` in `ExperienceSection.module.scss`).

## Viewport and Visibility Gating

The hero scene uses browser-only and intersection-based gating:

- dynamic import with `ssr: false`
- reduced-motion check
- IntersectionObserver visibility state

If you change render-heavy visuals, preserve these gates or an equivalent strategy.

## Validation Checklist

1. Respect reduced-motion preference.
2. Keep root layout statically renderable unless a deliberate architecture change is made.
3. Use CSS variables/tokens for theme-sensitive surfaces.
4. Separate Framer Motion transforms from Tailwind translate utilities when both are needed.
5. Avoid hydration mismatches from responsive JS state when CSS can solve the problem.
6. Gate expensive client-only visuals appropriately.

## Common Mistakes

- Reading theme from request-time APIs and accidentally making the app dynamic.
- Applying Tailwind translate and Motion `x`/`y` on the same node.
- Using mount-time media-query state for layout-critical transforms that should be CSS-driven.
- Forgetting to disable or simplify motion for reduced-motion users.
