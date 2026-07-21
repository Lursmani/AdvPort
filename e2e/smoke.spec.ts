import { expect, test } from "@playwright/test";
import { messages } from "./helpers";

// Runs in both projects (desktop and mobile) as the pipeline canary: if this
// fails, the webServer build or a runtime crash is the problem, not a feature.
test("renders the localized home page without runtime errors", async ({
  page,
}) => {
  const pageErrors: Error[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error);
  });

  await page.goto("/en");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    messages.en.HeroBanner.name,
  );
  await expect(page.locator("main#page-content")).toBeVisible();
  expect(pageErrors).toEqual([]);
});
