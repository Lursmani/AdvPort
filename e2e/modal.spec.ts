import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  expectFocusInside,
  fill,
  getOpenGalleryButton,
  getOpenProjectButton,
  gotoExperience,
  gotoHome,
  messages,
  openExperienceModal,
} from "./helpers";

const en = messages.en;

function getCloseButton(page: Page) {
  return page.getByRole("button", {
    name: en.ExperienceSection.actions.closeModal,
  });
}

/** The shared overlay contract from src/utils/overlayFocus.ts, while open. */
async function expectOverlayOpen(page: Page) {
  const pageContent = page.locator("#page-content");

  await expect(pageContent).toHaveAttribute("inert");
  await expect(pageContent).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(page.locator("html")).toHaveAttribute(
    "data-experience-modal-open",
    "true",
  );
  // The header watches the html attribute and removes itself entirely.
  await expect(page.locator("header")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("header")).toHaveAttribute("inert");
}

/** Everything the cleanup path must restore, plus focus on the trigger. */
async function expectOverlayReleased(page: Page, trigger: Locator) {
  const pageContent = page.locator("#page-content");

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(pageContent).not.toHaveAttribute("inert");
  await expect(pageContent).not.toHaveAttribute("aria-hidden");
  await expect(page.locator("body")).toHaveCSS("overflow", "visible");
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-experience-modal-open",
  );
  await expect(page.locator("header")).not.toHaveAttribute("aria-hidden");
  await expect(page.locator("header")).not.toHaveAttribute("inert");
  await expect(trigger).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await gotoHome(page);
});

test("opens from the title button with the full overlay contract", async ({
  page,
}) => {
  const bodyPaddingBefore = await page
    .locator("body")
    .evaluate((body) => window.getComputedStyle(body).paddingRight);

  const dialog = await openExperienceModal(page, 0);

  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toHaveAttribute(
    "aria-labelledby",
    /experience-modal-title/,
  );
  await expect(getCloseButton(page)).toBeFocused();
  await expectOverlayOpen(page);

  await page.keyboard.press("Escape");

  await expectOverlayReleased(page, getOpenProjectButton(page, 0));
  // Scrollbar compensation must be unwound to the pre-open value.
  await expect(page.locator("body")).toHaveCSS(
    "padding-right",
    bodyPaddingBefore,
  );
});

test("opens from the picture button and restores focus to it", async ({
  page,
}) => {
  await gotoExperience(page);

  const galleryTrigger = getOpenGalleryButton(page, 0);

  await galleryTrigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(getCloseButton(page)).toBeFocused();

  await page.keyboard.press("Escape");

  await expectOverlayReleased(page, galleryTrigger);
});

test("closes with the close button", async ({ page }) => {
  await openExperienceModal(page, 0);
  await getCloseButton(page).click();

  await expectOverlayReleased(page, getOpenProjectButton(page, 0));
});

test("closes on backdrop click", async ({ page }) => {
  await openExperienceModal(page, 0);

  // computeTargetRect centers a max-1040px panel on a 1280px viewport, so the
  // far-left edge is always backdrop.
  await page.mouse.click(20, 400);

  await expectOverlayReleased(page, getOpenProjectButton(page, 0));
});

test("traps Tab focus inside the dialog", async ({ page }) => {
  const dialog = await openExperienceModal(page, 0);
  const closeButton = getCloseButton(page);

  await expect(closeButton).toBeFocused();

  // Shift+Tab from the first tabbable wraps to the last, staying inside.
  await page.keyboard.press("Shift+Tab");
  await expectFocusInside(dialog);
  await expect(closeButton).not.toBeFocused();

  // Tab from the last tabbable wraps forward to the first again.
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();

  // A full walk never escapes the dialog.
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press("Tab");
    await expectFocusInside(dialog);
  }
});

test("second project opens its own content", async ({ page }) => {
  const dialog = await openExperienceModal(page, 1);

  await expect(dialog).toContainText(
    en.ExperienceSection.projects.energyFlip.title,
  );
  await expect(
    dialog.getByRole("button", {
      name: en.ExperienceSection.actions.closeModal,
    }),
  ).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(
    page.getByRole("button", {
      name: fill(en.ExperienceSection.actions.openProject, {
        title: en.ExperienceSection.projects.energyFlip.title,
      }),
    }),
  ).toBeFocused();
});
