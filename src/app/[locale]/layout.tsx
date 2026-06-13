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
  siteName,
  siteTitles,
  siteUrl,
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
  const languageAlternates = Object.fromEntries(
    locales.map((candidateLocale) => [
      localeLanguageTags[candidateLocale],
      getLocalePath(candidateLocale),
    ]),
  );
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
      languages: {
        ...languageAlternates,
        "x-default": getLocalePath(defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: pageTitle,
      description: siteDescriptions[locale],
      siteName,
      locale: localeOpenGraphTags[locale],
      alternateLocale: alternateLocales,
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description: siteDescriptions[locale],
    },
    manifest: `/${locale}/manifest.webmanifest`,
    icons: {
      icon: "/file.svg",
      apple: "/file.svg",
    },
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
