import { expect, test, type Page } from "@playwright/test";
import { fill, gotoHome, messages } from "./helpers";

const en = messages.en;

function getToggleButton(page: Page, targetTheme: "light" | "dark") {
  return page.getByRole("button", {
    name: fill(en.Header.actions.switchToTheme, {
      theme: en.Header.themes[targetTheme],
    }),
  });
}

test("toggles the theme and persists it across reloads", async ({ page }) => {
  await gotoHome(page);

  // Playwright emulates a light OS scheme by default; defaultTheme="system"
  // resolves to light.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await getToggleButton(page, "dark").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(getToggleButton(page, "light")).toBeVisible();

  // The explicit choice is stored client-side and must survive a reload.
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await getToggleButton(page, "light").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test.describe("dark OS scheme", () => {
  test.use({ colorScheme: "dark" });

  test("follows the system preference by default", async ({ page }) => {
    await page.goto("/en");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
