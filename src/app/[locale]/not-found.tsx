"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Rendered within the locale layout, so NextIntlClientProvider is available.
// not-found.tsx does not receive params, so the locale comes from context via
// useTranslations and the localized Link from @/i18n/navigation.
export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-foreground-soft text-xs font-semibold uppercase tracking-[0.24em]">
        404
      </p>
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        {t("title")}
      </h1>
      <p className="text-foreground-muted max-w-md text-base leading-7">
        {t("description")}
      </p>
      <Link
        href="/"
        className="hero-glass rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-foreground-soft transition-colors duration-300 hover:text-foreground"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
