import { NextResponse } from "next/server";
import {
  siteDescriptions,
  siteName,
  siteTitles,
  themeBackgroundColors,
} from "@/app/site";
import {
  defaultLocale,
  isValidLocale,
  locales,
  type AppLocale,
} from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: requestedLocale } = await params;
  const locale: AppLocale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  const manifest = {
    name: siteTitles[locale],
    short_name: siteName,
    description: siteDescriptions[locale],
    start_url: `/${locale}`,
    scope: "/",
    display: "standalone",
    background_color: themeBackgroundColors.dark,
    theme_color: themeBackgroundColors.dark,
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
