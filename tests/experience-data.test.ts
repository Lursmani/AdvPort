import { describe, expect, it } from "vitest";

import {
  EXPERIENCE_PROJECTS,
  getExperienceTimeline,
  getExperienceToneStyle,
  type ExperienceTone,
} from "../src/components/experience/experience-data";
import { defaultLocale, locales } from "../src/i18n/config";

// Record<ExperienceTone, true> makes TypeScript reject this test file when a
// new tone joins the union, forcing the coverage list to stay exhaustive.
const TONE_COVERAGE: Record<ExperienceTone, true> = {
  amber: true,
  teal: true,
  slate: true,
};
const TONES = Object.keys(TONE_COVERAGE) as ExperienceTone[];

describe("getExperienceTimeline", () => {
  const [project] = EXPERIENCE_PROJECTS;

  it.each(locales)("returns the %s timeline for a supported locale", (locale) => {
    expect(getExperienceTimeline(project.timeline, locale)).toBe(
      project.timeline[locale],
    );
  });

  it("falls back to the default locale for unsupported locale strings", () => {
    for (const candidate of ["", "de", "EN"]) {
      expect(getExperienceTimeline(project.timeline, candidate), candidate).toBe(
        project.timeline[defaultLocale],
      );
    }
  });
});

describe("getExperienceToneStyle", () => {
  it.each(TONES)("defines both accent variables for the %s tone", (tone) => {
    const style = getExperienceToneStyle(tone) as Record<string, string>;

    expect(style["--experience-accent"]).toBeTruthy();
    expect(style["--experience-accent-strong"]).toBeTruthy();
  });
});

describe("experience project data", () => {
  it("uses a unique id per project", () => {
    const ids = EXPERIENCE_PROJECTS.map((project) => project.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every project at least one image and one tag", () => {
    for (const project of EXPERIENCE_PROJECTS) {
      expect(project.imageSources.length, project.id).toBeGreaterThan(0);
      expect(project.tagIds.length, project.id).toBeGreaterThan(0);
    }
  });

  it("does not repeat a tag within a project", () => {
    for (const project of EXPERIENCE_PROJECTS) {
      expect(new Set(project.tagIds).size, project.id).toBe(
        project.tagIds.length,
      );
    }
  });

  it("localizes every project timeline for every locale", () => {
    for (const project of EXPERIENCE_PROJECTS) {
      for (const locale of locales) {
        expect(
          project.timeline[locale]?.trim(),
          `${project.id} timeline for ${locale}`,
        ).toBeTruthy();
      }
    }
  });
});
