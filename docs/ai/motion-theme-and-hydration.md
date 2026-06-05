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

Theme is client-authoritative through `next-themes` in `src/providers/ThemeProvider.tsx`.

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

Key rule:

- do not combine Framer Motion transform animation and Tailwind translate utilities on the same element

When both are needed:

- apply motion transforms to an outer wrapper
- apply static utility transforms to a nested child

Canonical reference: `src/components/skills/SkillCard.tsx`

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
