"use client";

import GlyphButton from "@/components/GlyphButton";
import {
  defaultLocale,
  isValidLocale,
  locales,
  type AppLocale,
} from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useTransition } from "react";

const flagByLocale: Record<AppLocale, { alt: string; src: string }> = {
  en: {
    alt: "English flag",
    src: "/flags/UKFlag.svg",
  },
  nl: {
    alt: "Dutch flag",
    src: "/flags/NLFlag.svg",
  },
  ka: {
    alt: "Georgian flag",
    src: "/flags/GEFlag.svg",
  },
};

function LanguageSwitcher() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isLocalePending, startLocaleTransition] = useTransition();
  const currentLocale = isValidLocale(locale) ? locale : defaultLocale;
  const nextLocale =
    locales[(locales.indexOf(currentLocale) + 1) % locales.length];

  const nextLanguageLabel = t("actions.switchToLanguage", {
    language: t(`languages.${nextLocale}`),
  });

  const handleToggleLocale = () => {
    startLocaleTransition(() => {
      const search =
        typeof window === "undefined" ? "" : window.location.search;
      const hash = typeof window === "undefined" ? "" : window.location.hash;
      const targetPath = `${pathname}${search}${hash}`;

      router.replace(targetPath, {
        locale: nextLocale,
        scroll: false,
      });
    });
  };

  return (
    <GlyphButton
      type="button"
      onClick={handleToggleLocale}
      disabled={isLocalePending}
      aria-label={nextLanguageLabel}
      title={nextLanguageLabel}
    >
      <span className="relative flex size-5 items-center justify-center overflow-hidden">
        <Image
          src={flagByLocale[currentLocale].src}
          alt={flagByLocale[currentLocale].alt}
          width={20}
          height={20}
          className="size-5"
        />
      </span>
    </GlyphButton>
  );
}

export default LanguageSwitcher;
