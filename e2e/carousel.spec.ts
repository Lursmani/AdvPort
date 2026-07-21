import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  getCarouselRegion,
  getCarouselState,
  gotoExperience,
  gotoHome,
  messages,
} from "./helpers";

const en = messages.en;

function getPrevButton(page: Page) {
  return page.getByRole("button", {
    name: en.ExperienceSection.actions.previousProject,
  });
}

function getNextButton(page: Page) {
  return page.getByRole("button", {
    name: en.ExperienceSection.actions.nextProject,
  });
}

async function expectClosestIndex(page: Page, index: number) {
  await expect
    .poll(async () => (await getCarouselState(page)).closestIndex)
    .toBe(index);
}

/**
 * Clicks a control until it reports aria-disabled. The controls stay
 * focusable at track ends (aria-disabled, not disabled), so the guard bounds
 * the loop instead of the click itself failing.
 */
async function clickWhileEnabled(page: Page, button: Locator, guard = 6) {
  for (let attempt = 0; attempt < guard; attempt += 1) {
    if ((await button.getAttribute("aria-disabled")) === "true") {
      return;
    }

    const scrollLeftBefore = (await getCarouselState(page)).scrollLeft;

    await button.click();
    await expect
      .poll(async () => {
        const state = await getCarouselState(page);
        const disabled = await button.getAttribute("aria-disabled");

        return state.scrollLeft !== scrollLeftBefore || disabled === "true";
      })
      .toBe(true);
  }
}

test.beforeEach(async ({ page }) => {
  await gotoHome(page);
  await gotoExperience(page);
});

test("exposes APG carousel semantics", async ({ page }) => {
  const region = getCarouselRegion(page);

  await expect(region).toHaveAttribute(
    "aria-roledescription",
    en.ExperienceSection.actions.carouselRoleDescription,
  );
  await expect(region).toHaveAttribute(
    "aria-label",
    en.ExperienceSection.actions.carouselLabel,
  );
});

test("starts with prev disabled and next enabled, without a wrong flash", async ({
  page,
}) => {
  // The layout effect corrects both flags before first paint, so this must
  // already hold immediately after render.
  await expect(getPrevButton(page)).toHaveAttribute("aria-disabled", "true");
  await expect(getNextButton(page)).toHaveAttribute("aria-disabled", "false");
  expect((await getCarouselState(page)).atStart).toBe(true);
});

test("next walks to the track end and prev walks back", async ({ page }) => {
  const nextButton = getNextButton(page);
  const prevButton = getPrevButton(page);

  await clickWhileEnabled(page, nextButton);

  await expect(nextButton).toHaveAttribute("aria-disabled", "true");
  await expect(prevButton).toHaveAttribute("aria-disabled", "false");
  expect((await getCarouselState(page)).atEnd).toBe(true);

  await clickWhileEnabled(page, prevButton);

  await expect(prevButton).toHaveAttribute("aria-disabled", "true");
  await expect(nextButton).toHaveAttribute("aria-disabled", "false");
  expect((await getCarouselState(page)).atStart).toBe(true);
});

test.describe("narrow viewport (center snap)", () => {
  // Below the mobile breakpoint each card has a distinct snap position, which
  // the wide desktop viewport cannot guarantee (the track end clamps early).
  test.use({ viewport: { width: 412, height: 915 } });

  test("advances exactly one card per click", async ({ page }) => {
    const nextButton = getNextButton(page);

    await expectClosestIndex(page, 0);

    await nextButton.click();
    await expectClosestIndex(page, 1);

    await nextButton.click();
    await expectClosestIndex(page, 2);

    await getPrevButton(page).click();
    await expectClosestIndex(page, 1);
  });

  test("rapid clicks accumulate instead of resolving against a stale position", async ({
    page,
  }) => {
    const nextButton = getNextButton(page);

    await nextButton.click();
    await nextButton.click();

    // pendingIndexRef makes the second click advance from the first click's
    // target, so a double click lands two cards ahead.
    await expectClosestIndex(page, 2);
  });

  test("manual wheel scroll supersedes the queued click target", async ({
    page,
  }) => {
    const nextButton = getNextButton(page);

    await nextButton.click();
    await expectClosestIndex(page, 1);

    // Wheel back to the start: the wheel listener clears pendingIndexRef.
    const regionBox = await getCarouselRegion(page).boundingBox();

    if (!regionBox) {
      throw new Error("Carousel region has no bounding box");
    }

    await page.mouse.move(
      regionBox.x + regionBox.width / 2,
      regionBox.y + regionBox.height / 2,
    );
    await page.mouse.wheel(-1600, 0);
    await expect
      .poll(async () => (await getCarouselState(page)).atStart)
      .toBe(true);

    // Next must resume from the real position (0 -> 1), not the stale queued
    // index (1 -> 2).
    await nextButton.click();
    await expectClosestIndex(page, 1);
  });
});
