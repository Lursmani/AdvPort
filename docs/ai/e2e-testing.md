# E2E Testing (Playwright)

Suite layout: `playwright.config.ts` + `e2e/*.spec.ts`. Run with
`npm run test:e2e` (or `npm run test:e2e:ui`). CI runs it via
`.github/workflows/e2e.yml`.

## Conventions that are easy to get wrong

- **Production server, dedicated port.** The suite builds and serves on port
  `3100` (never a dev server, never port 3000 — a local `next dev` may own
  it). Locally a server already listening on 3100 is reused; keep it on the
  current build or results lie.
- **Reduced motion is the suite default.** `contextOptions.reducedMotion:
  "reduce"` in the config both exercises the reduced-motion paths required by
  the working agreement and collapses Framer Motion transitions to duration 0,
  which removes animation flake. `e2e/motion.spec.ts` is the only file that
  opts back into real animations — put animation-settling assertions there
  (e.g. the experience modal's settled `backdrop-filter`).
- **Locators come from `messages/en.json`.** Import catalogs through
  `e2e/helpers.ts` and resolve accessible names with its `fill()` helper
  instead of hard-coding label strings, so catalog edits fail loudly.
- **Two projects.** `chromium-desktop` (1280×800, skips `drawer.spec.ts`) and
  `chromium-mobile` (Pixel 7, runs only drawer + smoke). The drawer only
  exists below the `md` breakpoint. Carousel index/traversal tests run in a
  narrow-viewport `test.use({ viewport })` describe because on wide viewports
  the track end clamps before each card gets a distinct snap position.
- **`whileInView` sections need a scroll first.** Carousel cards reveal via
  `whileInView` (`once: true`); use `gotoExperience()` from the helpers before
  interacting with cards.
- **Hydration gate.** The theme toggle is disabled until next-themes mounts;
  `waitForHydration()` (helpers) must run before keyboard or client-side
  interaction tests. `gotoHome()` does this for `/en`.
- **Vitest must not see `e2e/`.** Playwright specs match Vitest's default
  `*.spec.ts` glob; `vitest.config.ts` excludes `e2e/**`. Keep it that way
  when renaming files.
- **`next build` type-checks the specs.** `tsconfig.json` includes `e2e/`, so
  type errors in specs fail the production build (this is deliberate — the
  Playwright transpiler alone would not catch them).

## What the suite guards

The P0 files encode contracts from `AGENTS.md`:

- `modal.spec.ts` / `drawer.spec.ts` — the `trapOverlayFocus` contract:
  background `inert` + `aria-hidden`, scroll lock with scrollbar
  compensation, initial focus, Tab wrap, Escape, and focus restoration
  (including the paths that intentionally skip restoration).
- `carousel.spec.ts` — `aria-disabled` control states, snap-index math,
  rapid-click accumulation (`pendingIndexRef`), manual-scroll supersession.
- `locale-switcher.spec.ts` — query-string and hash preservation across the
  locale switch with a single history entry. Note: the pending hash must live
  in module scope (`LanguageSwitcherUtils`), because the `[locale]` segment
  remount destroys component state mid-switch.
- `navigation.spec.ts` — header tab order, anchor navigation, scroll-state
  class.
