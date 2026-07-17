import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { buildLanguageAlternates, getLocalePath, siteUrl } from "@/app/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Cluster the locale URLs as translations of one another so search engines
  // treat them as a single localized entry set. lastModified is intentionally
  // omitted: the sitemap is statically generated, so a date here would be the
  // build timestamp — bumped on every deploy — not a real content-change date.
  const languages = buildLanguageAlternates(siteUrl);

  return locales.map((locale, index) => ({
    url: `${siteUrl}${getLocalePath(locale)}`,
    changeFrequency: "monthly",
    priority: index === 0 ? 1 : 0.9,
    alternates: { languages },
  }));
}
