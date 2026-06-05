---
name: add-experience-project
description: "Add or update an experience project in AdvPort. Use for experience-data changes, gallery images, project tags, localized project copy, and carousel/modal-backed experience entries."
argument-hint: "Describe the project entry to add or change"
---

# Add an Experience Project

Use this skill when working in the experience carousel data model.

## Procedure

1. Read `docs/ai/experience-entry.md`.
2. Update `src/components/experience/experience-data.ts` first.
3. Keep stable IDs, tone, tag IDs, localized timeline data, image sources, and external links in the data model.
4. Add or update localized project content in all locale catalogs.
5. Keep tag IDs and image ordering intentional.
6. Preserve the existing card, carousel, gallery, and modal data flow.
7. Preserve focus restoration and modal behavior if interaction logic changes.

## Canonical References

- `docs/ai/experience-entry.md`
- `src/components/experience/experience-data.ts`
- `src/components/experience/ExperienceSection.tsx`
- `src/components/experience/ExperienceCarousel.tsx`
- `src/components/experience/ExperienceModal.tsx`
