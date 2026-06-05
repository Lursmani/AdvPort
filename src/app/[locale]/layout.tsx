import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { rootHtmlClassName } from "@/app/fonts";
import {
  getLocalePath,
  localeLanguageTags,
  localeOpenGraphTags,
  siteDescriptions,
  siteImagePath,
  siteName,
  siteTitle,
  siteUrl,
} from "@/app/site";
import {
  defaultLocale,
  isValidLocale,
  locales,
  type AppLocale,
} from "@/i18n/config";
import ThemeProvider from "@/providers/ThemeProvider";
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
  const languageAlternates = Object.fromEntries(
    locales.map((candidateLocale) => [
      localeLanguageTags[candidateLocale],
      getLocalePath(candidateLocale),
    ]),
  );
  const alternateLocales = locales
    .filter((candidateLocale) => candidateLocale !== locale)
    .map((candidateLocale) => localeOpenGraphTags[candidateLocale]);

  return {
    metadataBase: new URL(siteUrl),
    title: siteTitle,
    description: siteDescriptions[locale],
    alternates: {
      canonical: canonicalPath,
      languages: {
        ...languageAlternates,
        "x-default": getLocalePath(defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: siteTitle,
      description: siteDescriptions[locale],
      siteName,
      locale: localeOpenGraphTags[locale],
      alternateLocale: alternateLocales,
      images: [
        {
          url: siteImagePath,
          alt: `${siteName} portrait`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescriptions[locale],
      images: [siteImagePath],
    },
    manifest: "/manifest.webmanifest",
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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

  const locale = requestedLocale ?? defaultLocale;

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning className={rootHtmlClassName}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
