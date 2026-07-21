import { expect, test, type Page } from "@playwright/test";
import { fill, gotoHome, messages, waitForHydration } from "./helpers";

// The switcher cycles en -> nl -> ka -> en. Its accessible name announces the
// NEXT locale, localized in the CURRENT locale.
function getSwitcherButton(page: Page, currentLocale: "en" | "nl" | "ka") {
  const nextLocale = { en: "nl", nl: "ka", ka: "en" }[currentLocale] as
    | "en"
    | "nl"
    | "ka";
  const current = messages[currentLocale];

  return page.getByRole("button", {
    name: fill(current.Header.actions.switchToLanguage, {
      language: current.Header.languages[nextLocale],
    }),
  });
}

test("preserves query string and hash across a locale switch", async ({
  page,
}) => {
  await page.goto("/en?foo=bar#experience");
  await waitForHydration(page);

  const historyLengthBefore = await page.evaluate(
    () => window.history.length,
  );

  await getSwitcherButton(page, "en").click();

  // getLocaleSwitchHref keeps the query; the pending-hash effect restores the
  // fragment with replaceState after next-intl drops it.
  await expect(page).toHaveURL("/nl?foo=bar#experience");
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await expect(
    page.getByRole("heading", { name: messages.nl.SkillsSection.title }),
  ).toBeVisible();

  // router.replace + history.replaceState: the switch must not add an entry.
  expect(await page.evaluate(() => window.history.length)).toBe(
    historyLengthBefore,
  );
});

test("cycles through all locales and back", async ({ page }) => {
  await gotoHome(page);

  await getSwitcherButton(page, "en").click();
  await expect(page).toHaveURL(/\/nl$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");

  await getSwitcherButton(page, "nl").click();
  await expect(page).toHaveURL(/\/ka$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ka");

  await getSwitcherButton(page, "ka").click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("every locale renders directly from its static route", async ({
  page,
}) => {
  for (const locale of ["en", "nl", "ka"] as const) {
    await page.goto(`/${locale}`);

    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(
      page.getByRole("heading", {
        name: messages[locale].SkillsSection.title,
      }),
    ).toBeVisible();
  }
});
