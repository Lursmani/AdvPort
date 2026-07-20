import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { defaultLocale, locales } from "../src/i18n/config";
import {
  buildLanguageAlternates,
  getLocalePath,
  localeLanguageTags,
  siteDescriptions,
  siteEmail,
  siteJobTitles,
  siteName,
  siteSameAs,
  siteTitles,
  siteUrl,
  themeBackgroundColors,
} from "../src/app/site";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import { generatePersonJsonLd } from "../src/utils/jsonLd";
import {
  GET as getManifest,
  generateStaticParams as manifestStaticParams,
} from "../src/app/[locale]/manifest.webmanifest/route";

type ManifestPayload = {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  background_color: string;
  theme_color: string;
  icons: { src: string }[];
};

async function fetchManifest(locale: string) {
  const response = await getManifest(
    new Request(`https://example.test/${locale}/manifest.webmanifest`),
    { params: Promise.resolve({ locale }) },
  );

  return {
    response,
    manifest: (await response.json()) as ManifestPayload,
  };
}

describe("buildLanguageAlternates", () => {
  it("maps every locale's language tag to its path plus an x-default", () => {
    const alternates = buildLanguageAlternates();

    expect(Object.keys(alternates)).toHaveLength(locales.length + 1);

    for (const locale of locales) {
      expect(alternates[localeLanguageTags[locale]]).toBe(
        getLocalePath(locale),
      );
    }

    expect(alternates["x-default"]).toBe(getLocalePath(defaultLocale));
  });

  it("prefixes every entry with the base URL when one is passed", () => {
    const relative = buildLanguageAlternates();
    const absolute = buildLanguageAlternates(siteUrl);

    expect(Object.keys(absolute)).toEqual(Object.keys(relative));

    for (const [languageTag, relativeUrl] of Object.entries(relative)) {
      expect(absolute[languageTag], languageTag).toBe(
        `${siteUrl}${relativeUrl}`,
      );
    }
  });
});

describe("sitemap", () => {
  const entries = sitemap();

  it("lists exactly one URL per locale", () => {
    expect(entries.map((entry) => entry.url)).toEqual(
      locales.map((locale) => `${siteUrl}${getLocalePath(locale)}`),
    );
  });

  it("prioritizes the default locale above the alternates", () => {
    const [first, ...rest] = entries;

    expect(first.url).toBe(`${siteUrl}${getLocalePath(defaultLocale)}`);
    expect(first.priority).toBe(1);

    for (const entry of rest) {
      expect(entry.priority).toBe(0.9);
    }
  });

  it("clusters the locale URLs as translations of one another", () => {
    const expectedLanguages = buildLanguageAlternates(siteUrl);

    for (const entry of entries) {
      expect(entry.alternates?.languages).toEqual(expectedLanguages);
    }
  });
});

describe("robots", () => {
  it("allows crawling everything and points at the sitemap", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    });
  });
});

describe("generatePersonJsonLd", () => {
  it.each(locales)("localizes the %s schema from the site records", (locale) => {
    const schema = generatePersonJsonLd(locale);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe(siteName);
    expect(schema.url).toBe(`${siteUrl}/${locale}`);
    expect(schema.jobTitle).toBe(siteJobTitles[locale]);
    expect(schema.description).toBe(siteDescriptions[locale]);
    expect(schema.email).toBe(siteEmail);
    expect(schema.sameAs).toEqual(siteSameAs);
    expect(schema.knowsAbout.length).toBeGreaterThan(0);
  });
});

describe("manifest route", () => {
  it("statically generates one manifest per locale", () => {
    expect(manifestStaticParams()).toEqual(
      locales.map((locale) => ({ locale })),
    );
  });

  it.each(locales)("serves the localized %s manifest", async (locale) => {
    const { response, manifest } = await fetchManifest(locale);

    expect(response.headers.get("Content-Type")).toBe(
      "application/manifest+json",
    );
    expect(manifest.name).toBe(siteTitles[locale]);
    expect(manifest.short_name).toBe(siteName);
    expect(manifest.description).toBe(siteDescriptions[locale]);
    expect(manifest.start_url).toBe(`/${locale}`);
    expect(manifest.background_color).toBe(themeBackgroundColors.dark);
    expect(manifest.theme_color).toBe(themeBackgroundColors.dark);
  });

  it("falls back to the default locale for an unknown locale", async () => {
    const { manifest } = await fetchManifest("zz");

    expect(manifest.name).toBe(siteTitles[defaultLocale]);
    expect(manifest.start_url).toBe(`/${defaultLocale}`);
  });

  it("only references icons that exist under public/", async () => {
    const { manifest } = await fetchManifest(defaultLocale);
    const missing = manifest.icons
      .map((icon) => icon.src)
      .filter(
        (src) =>
          !existsSync(
            path.resolve(process.cwd(), "public", ...src.split("/").filter(Boolean)),
          ),
      );

    expect(manifest.icons.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
