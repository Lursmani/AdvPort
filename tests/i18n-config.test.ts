import { describe, expect, it } from "vitest";

import { defaultLocale, isValidLocale, locales } from "../src/i18n/config";
import { routing } from "../src/i18n/routing";

describe("locale config", () => {
  it("accepts every configured locale", () => {
    for (const locale of locales) {
      expect(isValidLocale(locale), locale).toBe(true);
    }
  });

  it("rejects unknown and near-miss locale strings", () => {
    for (const candidate of ["", "de", "EN", "en-US", "ka-GE", "english"]) {
      expect(isValidLocale(candidate), candidate).toBe(false);
    }
  });

  it("uses a default locale that is part of the configured set", () => {
    expect(locales).toContain(defaultLocale);
  });
});

describe("routing", () => {
  it("mirrors the locale config", () => {
    expect(routing.locales).toEqual(locales);
    expect(routing.defaultLocale).toBe(defaultLocale);
  });

  it("always prefixes routes with the locale (repo contract in AGENTS.md)", () => {
    const { localePrefix } = routing;
    const mode =
      typeof localePrefix === "string" ? localePrefix : localePrefix?.mode;

    expect(mode).toBe("always");
  });
});
