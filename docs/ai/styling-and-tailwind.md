# Styling with Tailwind v4 and SCSS Modules

Use this guide when styling or restyling components in `AdvPort`.

## Styling Stack

This repo uses:

- Tailwind CSS v4
- Sass / SCSS
- CSS Modules for component-scoped complex styles
- `clsx` + `tailwind-merge` through `src/utils/cn.ts`

References:

- `src/app/globals.scss`
- `src/styles/_breakpoints.scss`
- `src/utils/cn.ts`
- `src/components/GlyphButton.tsx`
- `src/components/skills/SkillCard.tsx`
- `src/components/experience/ExperienceSection.module.scss`

## Rule of Thumb

Prefer Tailwind utilities for:

- layout
- spacing
- typography
- responsive flex/grid structure
- simple sizing and positioning
- stateful utility composition in JSX

Prefer `.module.scss` for:

- multi-layer decorative effects
- gradients, masks, blur overlays, and pseudo-elements
- complex component-local CSS variables
- visual systems that would become noisy or unreadable in utility strings
- advanced container/query-driven or effect-heavy component styling

Do not move simple layout rules into SCSS modules just because a module already exists.

## Theme Tokens

`src/app/globals.scss` is the styling source of truth.

It defines:

- theme-aware CSS custom properties like `--background`, `--foreground`, `--accent-*`
- Tailwind v4 `@theme inline` exports
- shared app-shell classes such as `.hero-glass`, `.header-shell`, and `.header-drawer`

Prefer existing CSS variables over hardcoded raw colors.

## Breakpoints

`src/styles/_breakpoints.scss` is the breakpoint source of truth.

- SCSS modules should use the breakpoint helpers from that file.
- Tailwind responsive utilities work because the same values are exported through `@theme` in `globals.scss`.
- Do not introduce a second breakpoint scale.

## Class Composition

Use `cn()` when a component mixes:

- CSS module classes
- optional `className` props
- conditional Tailwind classes

Example pattern:

```ts
className={cn(styles.cardEffect, "rounded-4xl", className)}
```

This ensures Tailwind conflicts are merged correctly.

## Known Repo-Specific Pitfalls

### Tailwind v4 diagnostics

The editor may report `Unknown at rule @theme` in global styles. In this repo that is a known false positive unless the actual build fails.

### Framer Motion vs Tailwind transforms

Framer Motion `x` and `y` animations override Tailwind translate utilities if both are applied to the same element.

Use the repo pattern from `src/components/skills/SkillCard.tsx`:

- motion transforms on an outer wrapper
- static Tailwind translate classes on a nested element

### Theme surfaces

Prefer CSS variables for theme-sensitive shell surfaces instead of inventing new hardcoded color utilities.

### Overflow safety

When reveal or entrance animation might widen layout on mobile, keep outer containers clipped on the x-axis. `ViewportSection` already uses `overflow-x-clip`.

## Choosing Between Utility and Module Styles

Ask these questions:

1. Is this mostly layout/spacing/typography? Use Tailwind.
2. Is this a reusable effect with pseudo-elements or layered gradients? Use a CSS module.
3. Does this component already rely on component-local CSS variables? A module is likely appropriate.
4. Is this only a one-line utility difference? Keep it in JSX, not SCSS.

## Validation Checklist

1. Reuse existing tokens from `globals.scss`.
2. Reuse the shared breakpoint scale.
3. Use `cn()` for mixed class composition.
4. Keep Tailwind and Framer Motion transforms on separate elements when both are needed.
5. Avoid new global classes unless the style is truly app-wide.
6. Keep simple layout logic out of SCSS modules.

## Reference Components

- `src/components/ViewportSection.tsx` — utility-first layout
- `src/components/skills/SkillCard.tsx` — utility + module + motion split pattern
- `src/components/contact/ContactSection.module.scss` — complex module styling
- `src/components/experience/ExperienceSection.module.scss` — advanced component-local visual system
