import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getLocalePath, siteUrl } from "@/app/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return locales.map((locale, index) => ({
    url: `${siteUrl}${getLocalePath(locale)}`,
    lastModified,
    changeFrequency: "monthly",
    priority: index === 0 ? 1 : 0.9,
  }));
}
