import { expect, test } from "@playwright/test";
import { messages } from "./helpers";

const en = messages.en;

test("the bare root redirects to the default locale", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("an unknown localized path renders the localized 404", async ({
  page,
}) => {
  const response = await page.goto("/en/does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: en.NotFound.title }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: en.NotFound.backHome }),
  ).toHaveAttribute("href", "/en");
});

test("an invalid locale prefix returns a 404", async ({ page }) => {
  const response = await page.goto("/de");

  expect(response?.status()).toBe(404);
});

test("SEO endpoints respond", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");

  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/en");

  const robots = await request.get("/robots.txt");

  expect(robots.status()).toBe(200);

  const manifest = await request.get("/en/manifest.webmanifest");

  expect(manifest.status()).toBe(200);
  expect(await manifest.json()).toHaveProperty("name");
});
