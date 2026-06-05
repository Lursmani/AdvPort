# Modal, Drawer, and Header Accessibility Patterns

Use this guide when modifying the mobile header drawer, the experience modal, or any similar overlay UI.

## Header Drawer Pattern

The mobile drawer behavior is implemented through:

- `src/components/Header.tsx`
- `src/components/header/util.ts`

Core behavior:

- focus moves into the drawer when it opens
- `Escape` closes the drawer
- `Tab` is trapped within the drawer
- the header shell and main page content are marked inert/aria-hidden while the drawer is open
- focus returns to the open button when appropriate
- resize to desktop closes the drawer safely

Preserve this pattern for any drawer-like UI.

## Experience Modal Pattern

The experience modal behavior is implemented through:

- `src/components/experience/ExperienceCarousel.tsx`
- `src/components/experience/ExperienceModal.tsx`

Core behavior:

- the triggering element is stored before opening
- focus returns to the trigger after close if still connected
- body scroll is locked while the modal is open
- scrollbar compensation is applied to avoid layout shift
- `Escape` closes the modal
- `Tab` is trapped within the modal panel
- document state is mirrored through `data-experience-modal-open`

Preserve this pattern for modal-like UI.

## Interaction Between Header and Modal

The header watches `data-experience-modal-open` and hides/deactivates itself while the experience modal is open.

If you add more overlay systems, decide deliberately whether they need to coordinate through a similar document-level state.

## Inert and Focus Safety

When disabling background UI:

- prefer `inert` plus `aria-hidden` on the background containers already used by the repo
- restore previous states on cleanup
- only restore focus to visible, connected elements

Reference utilities:

- `src/utils/domAccessibility.ts`
- `src/components/header/util.ts`

## Scroll Locking

When locking scroll:

- preserve previous inline styles
- compensate for scrollbar width when needed
- clean up on close even if the component unmounts quickly

## Validation Checklist

1. Move focus into the overlay on open.
2. Trap focus while the overlay is open.
3. Support `Escape` to close.
4. Restore focus on close when appropriate.
5. Mark background content inert/hidden where needed.
6. Lock scroll without causing avoidable layout shift.
7. Preserve coordination between the header and experience modal.

## Common Mistakes

- Closing an overlay without restoring focus.
- Trapping focus incompletely.
- Forgetting to restore inert/aria-hidden state.
- Locking body scroll without scrollbar compensation.
- Creating a second overlay pattern instead of reusing the established one.
