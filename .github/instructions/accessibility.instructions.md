---
description: "Use when implementing or changing a drawer, modal, header interaction, focus trap, scroll lock, or inert background behavior in AdvPort. Covers the established accessibility patterns used by the header and experience modal."
applyTo:
  [
    "src/components/Header.tsx",
    "src/components/header/**",
    "src/components/experience/**",
    "src/utils/domAccessibility.ts",
  ]
---

# AdvPort Accessibility Patterns

- Reuse the existing header drawer and experience modal patterns before creating new overlay behavior.
- Preserve focus restoration, focus trapping, `Escape` handling, inert background handling, and scroll-lock cleanup.
- `src/components/header/util.ts`, `src/components/experience/ExperienceCarousel.tsx`, and `src/components/experience/ExperienceModal.tsx` are canonical references.
- Restore previous DOM state on cleanup.
- Read `docs/ai/modal-and-header-a11y.md` before non-trivial overlay changes.
