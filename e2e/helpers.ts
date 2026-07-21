import { expect, type Locator, type Page } from "@playwright/test";
import en from "../messages/en.json";
import ka from "../messages/ka.json";
import nl from "../messages/nl.json";

/**
 * Locators are derived from the message catalogs instead of hard-coded
 * strings so label edits fail loudly here rather than silently breaking a
 * selector. Functional specs run against /en; only the locale-switcher spec
 * touches nl/ka.
 */
export const messages = { en, nl, ka } as const;

export type TestLocale = keyof typeof messages;

/** Fill a next-intl ICU-style placeholder: fill("Switch to {language}", { language: "Dutch" }). */
export function fill(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(
    /\{(\w+)\}/g,
    (match, key: string) => values[key] ?? match,
  );
}

/** Card order mirrors EXPERIENCE_PROJECTS in src/components/experience/experience-data.ts. */
export const EN_PROJECT_TITLES = [
  en.ExperienceSection.projects.energyGrip.title,
  en.ExperienceSection.projects.energyFlip.title,
  en.ExperienceSection.projects.consultancyWork.title,
  en.ExperienceSection.projects.universalTransit.title,
] as const;

/**
 * The theme toggle is rendered disabled until next-themes mounts, so it
 * becoming enabled marks hydration as complete. English pages only — the
 * accessible name is locale-dependent.
 */
export async function waitForHydration(page: Page) {
  await expect(
    page.getByRole("button", { name: /switch to (dark|light) theme/i }),
  ).toBeEnabled();
}

export async function gotoHome(page: Page, locale: TestLocale = "en") {
  await page.goto(`/${locale}`);

  if (locale === "en") {
    await waitForHydration(page);
  }
}

export function getCarouselRegion(page: Page) {
  return page.locator('#experience [role="region"][aria-roledescription]');
}

export function getOpenProjectButton(page: Page, index = 0) {
  return page.getByRole("button", {
    name: fill(en.ExperienceSection.actions.openProject, {
      title: EN_PROJECT_TITLES[index],
    }),
  });
}

export function getOpenGalleryButton(page: Page, index = 0) {
  return page.getByRole("button", {
    name: fill(en.ExperienceSection.actions.openProjectImage, {
      title: EN_PROJECT_TITLES[index],
    }),
  });
}

/**
 * Scrolls the experience section into view. The carousel reveal is a
 * whileInView animation (once: true), so cards only become interactable after
 * the section has entered the viewport.
 */
export async function gotoExperience(page: Page) {
  await page.locator("#experience").scrollIntoViewIfNeeded();
  await expect(getOpenProjectButton(page, 0)).toBeVisible();
}

/** Opens the experience modal from a card's title button and waits for it. */
export async function openExperienceModal(
  page: Page,
  index = 0,
): Promise<Locator> {
  await gotoExperience(page);
  await getOpenProjectButton(page, index).click();

  const dialog = page.getByRole("dialog");

  await expect(dialog).toBeVisible();

  return dialog;
}

export async function expectFocusInside(locator: Locator) {
  expect(
    await locator.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);
}

type CarouselState = {
  closestIndex: number;
  scrollLeft: number;
  maxScrollLeft: number;
  atStart: boolean;
  atEnd: boolean;
};

/**
 * Mirrors the snap-target math in ExperienceCarouselViewport
 * (getCardScrollLeft / findClosestCardIndex) so specs can assert on the
 * logical card index instead of raw pixel offsets.
 */
export async function getCarouselState(page: Page): Promise<CarouselState> {
  return page.evaluate(() => {
    const region = document.querySelector(
      '#experience [role="region"][aria-roledescription]',
    );
    const track = region?.querySelector("ul");
    const viewport = track?.parentElement;

    if (!track || !viewport) {
      throw new Error("Carousel viewport not found");
    }

    const cards = Array.from(track.children) as HTMLElement[];
    const maxScrollLeft = Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth,
    );
    const getCardScrollLeft = (card: HTMLElement) => {
      const snapAlign = window.getComputedStyle(card).scrollSnapAlign;
      const nextScrollLeft = snapAlign.includes("center")
        ? card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2
        : card.offsetLeft;

      return Math.min(Math.max(nextScrollLeft, 0), maxScrollLeft);
    };

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(getCardScrollLeft(card) - viewport.scrollLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return {
      closestIndex,
      scrollLeft: viewport.scrollLeft,
      maxScrollLeft,
      atStart: viewport.scrollLeft <= 4,
      atEnd: viewport.scrollLeft >= maxScrollLeft - 4,
    };
  });
}
