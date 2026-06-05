---
name: implement-modal-drawer-pattern
description: "Implement an AdvPort modal or drawer correctly. Use for focus restoration, focus trapping, inert background handling, Escape behavior, scroll locking, and header/overlay coordination."
argument-hint: "Describe the overlay UI you want to implement or change"
---

# Implement a Modal or Drawer Pattern

Use this skill when building or modifying overlay UI.

## Procedure

1. Read `docs/ai/modal-and-header-a11y.md`.
2. Decide whether the new UI is closer to the header drawer pattern or the experience modal pattern.
3. Move focus into the overlay on open.
4. Trap focus while open and support `Escape` to close.
5. Mark background content inert/hidden where appropriate.
6. Restore focus safely on close.
7. Lock and restore scroll correctly, including scrollbar compensation when needed.
8. Coordinate with global overlay state if the header or other surfaces must react.

## Canonical References

- `docs/ai/modal-and-header-a11y.md`
- `src/components/Header.tsx`
- `src/components/header/util.ts`
- `src/components/experience/ExperienceCarousel.tsx`
- `src/components/experience/ExperienceModal.tsx`
- `src/utils/domAccessibility.ts`
