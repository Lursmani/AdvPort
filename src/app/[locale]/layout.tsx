import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import LocaleHtmlAttributes from "@/i18n/LocaleHtmlAttributes";
import { defaultLocale, isValidLocale, locales } from "@/i18n/config";

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
    <>
      <LocaleHtmlAttributes locale={locale} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
