---
name: animate-ui-safely
description: "Animate UI safely in AdvPort. Use for Framer Motion transitions, reduced-motion support, hydration-safe responsive animation, theme-sensitive motion, and transform-conflict avoidance."
argument-hint: "Describe the animation or motion change"
---

# Animate UI Safely

Use this skill when adding or changing motion behavior.

## Procedure

1. Read `docs/ai/motion-theme-and-hydration.md`.
2. Respect `prefers-reduced-motion` and provide a no-motion or reduced-motion path.
3. Keep theme logic client-authoritative and compatible with static rendering.
4. Avoid hydration mismatches from layout-critical responsive JS state when CSS variables or media queries can solve the problem.
5. Keep Framer Motion transforms and Tailwind translate utilities on separate elements.
6. Gate expensive client-only visual systems appropriately.

## Canonical References

- `docs/ai/motion-theme-and-hydration.md`
- `src/providers/ThemeProvider.tsx`
- `src/components/Reveal.tsx`
- `src/components/skills/SkillCard.tsx`
- `src/components/hero/HeroBanner.tsx`
- `src/components/experience/ExperienceModal.tsx`
