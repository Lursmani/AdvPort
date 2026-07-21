import { expect, test, type Page } from "@playwright/test";
import { expectFocusInside, gotoHome, messages } from "./helpers";

// Runs only in the chromium-mobile project (see playwright.config.ts): the
// hamburger and drawer are md:hidden and only exist below that breakpoint.

const en = messages.en;

function getMenuButton(page: Page) {
  return page.getByRole("button", { name: en.Header.actions.openMenu });
}

function getCloseButton(page: Page) {
  return page.getByRole("button", { name: en.Header.actions.closeMenu });
}

async function openDrawer(page: Page) {
  await getMenuButton(page).click();

  const drawer = page.getByRole("dialog");

  await expect(drawer).toBeVisible();

  return drawer;
}

test.beforeEach(async ({ page }) => {
  await gotoHome(page);
});

test("opens with focus trapped and the background inerted", async ({
  page,
}) => {
  const menuButton = getMenuButton(page);

  await expect(menuButton).toHaveAttribute("aria-expanded", "false");

  const drawer = await openDrawer(page);

  await expect(drawer).toHaveAttribute("aria-modal", "true");
  await expect(getCloseButton(page)).toBeFocused();
  await expect(page.locator("#page-content")).toHaveAttribute("inert");
  await expect(page.locator(".header-shell")).toHaveAttribute("inert");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  // Tabbables: DL link, close button, four nav links. A full walk plus wrap
  // never escapes the drawer.
  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press("Tab");
    await expectFocusInside(drawer);
  }
});

test("Escape closes and restores focus to the menu button", async ({
  page,
}) => {
  await openDrawer(page);
  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("#page-content")).not.toHaveAttribute("inert");
  await expect(page.locator("body")).toHaveCSS("overflow", "visible");
  await expect(getMenuButton(page)).toBeFocused();
});

test("close button closes and restores focus", async ({ page }) => {
  await openDrawer(page);
  await getCloseButton(page).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(getMenuButton(page)).toBeFocused();
});

test("backdrop click closes and restores focus", async ({ page }) => {
  await openDrawer(page);

  // The drawer panel is min(22rem, 84vw) wide from the left; on a 412px
  // viewport anything past ~346px is backdrop.
  await page.mouse.click(400, 500);

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(getMenuButton(page)).toBeFocused();
});

test("nav link click closes without restoring focus to the menu button", async ({
  page,
}) => {
  const drawer = await openDrawer(page);

  await drawer
    .getByRole("link", { name: en.Header.nav.skills })
    .click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/#skills$/);
  await expect(page.locator("#skills")).toBeInViewport();
  // closeDrawer(false): focus deliberately follows the anchor instead of
  // snapping back to the hamburger.
  await expect(getMenuButton(page)).not.toBeFocused();
});

test("resizing to desktop closes the drawer", async ({ page }) => {
  await openDrawer(page);
  await page.setViewportSize({ width: 1024, height: 800 });

  await expect(page.getByRole("dialog")).toHaveCount(0);
  // The hamburger does not exist at desktop widths, so focus restoration is
  // intentionally skipped (see src/components/header/util.ts).
  await expect(getMenuButton(page)).toBeHidden();
  await expect(page.locator("#page-content")).not.toHaveAttribute("inert");
});

test("an opening experience modal force-closes the drawer", async ({
  page,
}) => {
  await openDrawer(page);

  // The modal announces itself via this html attribute; the header's
  // MutationObserver must react by closing the drawer and hiding the header.
  // Set it directly — with the drawer open the page content is inert, so this
  // is the only way the state can arrive.
  await page.evaluate(() => {
    document.documentElement.dataset.experienceModalOpen = "true";
  });

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("header")).toHaveAttribute("aria-hidden", "true");

  await page.evaluate(() => {
    delete document.documentElement.dataset.experienceModalOpen;
  });

  await expect(page.locator("header")).not.toHaveAttribute("aria-hidden");
  await expect(getMenuButton(page)).toBeVisible();
});
