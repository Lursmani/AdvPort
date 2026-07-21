import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E suite conventions (see docs/ai/e2e-testing.md):
 * - Runs against a production build on a dedicated port so a local `next dev`
 *   on 3000 is never reused (dev overlay and dev-only timing differ too much).
 * - `reducedMotion: "reduce"` is the suite default: it exercises the
 *   reduced-motion code paths required by AGENTS.md and collapses Framer
 *   Motion transitions to duration 0, removing animation flake. Specs that
 *   must cover the animated paths opt back in via
 *   `test.use({ contextOptions: { reducedMotion: "no-preference" } })`
 *   (see motion.spec.ts).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
      // The drawer only exists below the md breakpoint.
      testIgnore: /drawer\.spec\.ts/,
    },
    {
      name: "chromium-mobile",
      // Drawer specs need a sub-md viewport; Pixel 7 is 412x915.
      use: { ...devices["Pixel 7"] },
      testMatch: /(drawer|smoke)\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
