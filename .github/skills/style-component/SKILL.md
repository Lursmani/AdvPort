---
name: style-component
description: "Style a component the AdvPort way. Use for Tailwind v4, SCSS modules, theme tokens, breakpoints, class composition, and deciding between utilities and CSS modules."
argument-hint: "Describe the component and the styling goal"
---

# Style a Component

Use this skill when styling or restyling UI in `AdvPort`.

## Procedure

1. Read `docs/ai/styling-and-tailwind.md`.
2. Decide whether the work is mostly layout/spacing/typography or a complex local visual system.
3. Use Tailwind utilities for layout and responsive composition.
4. Use `.module.scss` only for complex visual effects, pseudo-elements, masks, or local CSS-variable systems.
5. Reuse tokens from `src/app/globals.scss` and breakpoints from `src/styles/_breakpoints.scss`.
6. Use `src/utils/cn.ts` when merging CSS module classes, conditional utilities, and incoming `className` props.
7. If Framer Motion is involved, keep motion transforms separate from Tailwind translate utilities.

## Canonical References

- `docs/ai/styling-and-tailwind.md`
- `src/app/globals.scss`
- `src/styles/_breakpoints.scss`
- `src/utils/cn.ts`
- `src/components/skills/SkillCard.tsx`
- `src/components/experience/ExperienceSection.module.scss`
