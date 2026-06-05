# Adding or Updating Experience Entries

Use this guide when editing the portfolio experience carousel, cards, or modal content.

## Canonical Data Source

The experience section is driven from `src/components/experience/experience-data.ts`.

Key structures:

- `EXPERIENCE_PROJECTS`
- `EXPERIENCE_TAG_IDS`
- `ExperienceProjectConfig`
- locale-aware `timeline`
- `imageSources`
- optional `externalLink`

Add or modify projects in the data source first, then ensure the message catalogs provide the localized text content.

## Text vs Data Split

`experience-data.ts` stores structural/configuration data:

- stable `id`
- localized timeline values
- tone
- tag IDs
- image source arrays
- optional external link

`ExperienceSection.tsx` resolves localized text from `messages/*.json` using the project `id`.

That means a new project usually requires changes in both places:

1. `experience-data.ts`
2. `messages/en.json`, `messages/nl.json`, `messages/ka.json`

## Images

Store project image paths in the image source map near the top of `experience-data.ts`.

Keep image arrays intentional:

- first image is the card preview source
- the full array is used by the modal gallery

Use stable asset naming in `public/images/experience/`.

## Tags

Tags come from `EXPERIENCE_TAG_IDS` and are localized through `ExperienceSection` using `t("tags.<id>")`.

When adding a new tag:

1. add the tag ID to `EXPERIENCE_TAG_IDS`
2. add its translation in all locale files
3. use that tag ID in the project config

## Modal and Carousel Consumers

Main consumers:

- `ExperienceSection.tsx`
- `ExperienceCarousel.tsx`
- `ExperienceCarouselViewport.tsx`
- `ExperienceModal.tsx`
- `ExperienceModalGallery.tsx`
- `ExperienceModalDetails.tsx`

Do not scatter project data across those components. Keep the data centralized.

## Accessibility and Interaction Expectations

The carousel/modal system already supports:

- focus restoration to the trigger after close
- scroll locking while modal is open
- keyboard handling

If you change open/close behavior, preserve those patterns.

## Validation Checklist

1. Add/update the project in `experience-data.ts`.
2. Add/update project copy in all locale catalogs.
3. Confirm the image array order is intentional.
4. Confirm tag IDs exist and are translated.
5. Confirm card, modal, and gallery consumers still derive from the same data shape.
6. Preserve focus restoration and modal behavior.

## Common Mistakes

- Adding a project ID in data but not in locale messages.
- Forgetting to translate new tags.
- Using one image path in the wrong position and changing the card preview unintentionally.
- Spreading project-specific logic into view components instead of the data model.
