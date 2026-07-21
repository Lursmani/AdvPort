import { expect, test } from "@playwright/test";
import {
  getOpenProjectButton,
  gotoExperience,
  gotoHome,
  messages,
  openExperienceModal,
} from "./helpers";

// The rest of the suite runs with reducedMotion: "reduce", which collapses
// every Framer Motion transition to duration 0. This file is the one place
// the real animated paths are exercised: enter/exit springs must settle and
// AnimatePresence exits must actually unmount.
test.use({ contextOptions: { reducedMotion: "no-preference" } });

test("experience modal flies open, settles into glass, and exits cleanly", async ({
  page,
}) => {
  await gotoHome(page);

  const dialog = await openExperienceModal(page, 0);

  // The glass treatment is applied only after the open spring lands
  // (onAnimationComplete -> modalPanelSettled), so this doubles as an
  // "animation completed" assertion.
  await expect(dialog).toHaveCSS("backdrop-filter", "blur(30px)");

  await page.keyboard.press("Escape");

  // The exit flight must finish and AnimatePresence must unmount the panel,
  // then focus restoration still applies.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(getOpenProjectButton(page, 0)).toBeFocused();
  await expect(page.locator("#page-content")).not.toHaveAttribute("inert");
});

test("carousel cards reveal once scrolled into view", async ({ page }) => {
  await gotoHome(page);
  await gotoExperience(page);

  const firstCardItem = page
    .locator("[data-experience-card]")
    .first()
    .locator("xpath=..");

  // whileInView (once) staggers the cards from opacity 0 to 1.
  await expect(firstCardItem).toHaveCSS("opacity", "1");
});

test.describe("mobile drawer", () => {
  test.use({ viewport: { width: 412, height: 915 } });

  test("drawer animates open and closed", async ({ page }) => {
    await gotoHome(page);
    await page
      .getByRole("button", { name: messages.en.Header.actions.openMenu })
      .click();

    const drawer = page.getByRole("dialog");

    await expect(drawer).toBeVisible();
    await expect(
      page.getByRole("button", { name: messages.en.Header.actions.closeMenu }),
    ).toBeFocused();

    await page.keyboard.press("Escape");

    // The slide-out exit must complete and unmount before focus returns.
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: messages.en.Header.actions.openMenu }),
    ).toBeFocused();
  });
});
