# Hero Scene Guidance

Use this guide when changing the hero animation system.

## Core Architecture

The hero effect is a React Three Fiber scene mounted from the localized home page and documented in `docs/hero-animation.md`.

Primary files:

- `src/components/hero/HeroBanner.tsx`
- `src/components/hero/FlowingScene.tsx`
- `src/components/hero/flowing-scene/LavaLampStack.tsx`
- `src/components/hero/flowing-scene/layer-models.ts`
- `src/components/hero/flowing-scene/LayerBlob.tsx`
- `src/components/hero/flowing-scene/noise.ts`
- `src/components/hero/flowing-scene/palette.ts`

Read `../hero-animation.md` before making non-trivial changes.

## Operational Rules

- Keep the scene client-only.
- Keep reduced-motion users out of the animated scene path.
- Keep visibility gating so offscreen scenes do not run continuously.
- Preserve theme-aware palette switching.
- Preserve geometry disposal and cleanup behavior.

## Pointer and Interaction Model

`HeroBanner.tsx` is the canonical source for pointer normalization and scene activation.

Do not duplicate pointer normalization logic elsewhere unless the architecture changes substantially.

## Performance and Stability

This scene is performance-sensitive and easy to destabilize.

When editing it:

- avoid unnecessary rerenders across the scene tree
- preserve dynamic import and browser-only guards
- keep geometry lifecycle and cleanup explicit
- validate reduced-motion behavior
- be cautious with dev-refresh behavior and mount timing

## Validation Checklist

1. Re-read `docs/hero-animation.md` before making structural hero changes.
2. Preserve reduced-motion gating.
3. Preserve visibility gating.
4. Preserve theme palette behavior.
5. Preserve cleanup and disposal logic.
6. Avoid introducing SSR coupling into the scene path.

## Common Mistakes

- Moving scene logic into an SSR path.
- Removing performance gates and increasing idle render cost.
- Breaking pointer normalization.
- Changing geometry lifecycle without cleanup.
- Ignoring reduced-motion users.
- Assuming `clock.getElapsedTime()` is monotonic across `frameloop` toggles — R3F resets the clock to zero every time it flips, so use the per-layer accumulated-time ref (`timeRef`) instead.
- Reading a geometry's live `boundingBox` after `geometry.center()` — `center()` mutates that box in place; capture any values you need beforehand.
