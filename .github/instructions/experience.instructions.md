---
description: "Use when adding or editing experience projects, carousel behavior, modal content, gallery images, or experience tags in AdvPort. Covers the shared experience data model and localized content split."
applyTo: "src/components/experience/**"
---

# AdvPort Experience Guidance

- Keep experience project structure centralized in `src/components/experience/experience-data.ts`.
- Store stable IDs, localized timeline data, tones, tag IDs, image sources, and external links in the data model.
- Keep localized project copy in `messages/*.json` under `ExperienceSection.projects.<id>`.
- Preserve the existing carousel and modal interaction patterns.
- Keep first-image vs gallery-image behavior intentional.
- Read `docs/ai/experience-entry.md` before non-trivial experience changes.
