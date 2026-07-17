import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { rootHtmlClassName } from "@/app/fonts";
import {
  buildLanguageAlternates,
  getLocalePath,
  localeOpenGraphTags,
  ogImagePath,
  siteDescriptions,
  siteName,
  siteTitles,
  siteUrl,
  themeBackgroundColors,
} from "@/app/site";
import {
  defaultLocale,
  isValidLocale,
  locales,
  type AppLocale,
} from "@/i18n/config";
import ThemeProvider from "@/providers/ThemeProvider";
import { generatePersonJsonLd } from "@/utils/jsonLd";
import "../globals.scss";

function resolveMetadataLocale(locale: string): AppLocale {
  return isValidLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requestedLocale } = await params;
  const locale = resolveMetadataLocale(requestedLocale);
  const canonicalPath = getLocalePath(locale);
  const languageAlternates = buildLanguageAlternates();
  const alternateLocales = locales
    .filter((candidateLocale) => candidateLocale !== locale)
    .map((candidateLocale) => localeOpenGraphTags[candidateLocale]);

  const pageTitle = siteTitles[locale];

  return {
    metadataBase: new URL(siteUrl),
    title: pageTitle,
    description: siteDescriptions[locale],
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates,
    },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: pageTitle,
      description: siteDescriptions[locale],
      siteName,
      locale: localeOpenGraphTags[locale],
      alternateLocale: alternateLocales,
      images: [{ url: ogImagePath, alt: siteName }],
    },
    twitter: {
      // The 1200x630 og-image is a wide card; "summary" would crop it square.
      card: "summary_large_image",
      title: pageTitle,
      description: siteDescriptions[locale],
      images: [ogImagePath],
    },
    manifest: `/${locale}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: siteName,
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// These meta tags only track the OS color scheme; ThemeColorSync in
// ThemeProvider rewrites them when the user overrides the theme.
export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: themeBackgroundColors.light,
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: themeBackgroundColors.dark,
    },
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: requestedLocale } = await params;

  if (!isValidLocale(requestedLocale)) {
    notFound();
  }

  const locale = requestedLocale;

  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const personJsonLd = generatePersonJsonLd(locale);

  return (
    <html lang={locale} suppressHydrationWarning className={rootHtmlClassName}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
