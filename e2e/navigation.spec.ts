import { expect, test } from "@playwright/test";
import { fill, gotoHome, messages } from "./helpers";

const en = messages.en;

test.beforeEach(async ({ page }) => {
  await gotoHome(page);
});

test("keyboard tab order walks the header controls in order", async ({
  page,
}) => {
  const expectedFocusOrder = [
    page.getByRole("link", { name: "DL" }),
    page.getByRole("link", { name: en.Header.nav.top }),
    page.getByRole("link", { name: en.Header.nav.skills }),
    page.getByRole("link", { name: en.Header.nav.experience }),
    page.getByRole("link", { name: en.Header.nav.contact }),
    page.getByRole("button", {
      name: fill(en.Header.actions.switchToLanguage, {
        language: en.Header.languages.nl,
      }),
    }),
    page.getByRole("button", {
      name: fill(en.Header.actions.switchToTheme, {
        theme: en.Header.themes.dark,
      }),
    }),
  ];

  for (const target of expectedFocusOrder) {
    await page.keyboard.press("Tab");
    await expect(target).toBeFocused();
  }
});

test("header nav links jump to their sections", async ({ page }) => {
  const sections = [
    { name: en.Header.nav.skills, id: "skills" },
    { name: en.Header.nav.experience, id: "experience" },
    { name: en.Header.nav.contact, id: "contact" },
  ] as const;

  for (const section of sections) {
    await page
      .locator("header")
      .getByRole("link", { name: section.name })
      .click();

    await expect(page).toHaveURL(new RegExp(`#${section.id}$`));
    await expect(page.locator(`#${section.id}`)).toBeInViewport();
  }

  await page
    .locator("header")
    .getByRole("link", { name: en.Header.nav.top })
    .click();

  await expect(page).toHaveURL(/#top$/);
  await expect(page.locator("#top")).toBeInViewport();
});

test("header shell activates past the scroll threshold", async ({ page }) => {
  const headerShell = page.locator(".header-shell");

  await expect(headerShell).not.toHaveClass(/header-shell--active/);

  await page.evaluate(() => {
    window.scrollTo(0, 400);
  });
  await expect(headerShell).toHaveClass(/header-shell--active/);

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await expect(headerShell).not.toHaveClass(/header-shell--active/);
});
