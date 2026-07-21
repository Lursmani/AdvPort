"use client";

import GlyphButton from "@/components/GlyphButton";
import {
  consumePendingLocaleSwitchHash,
  getLocaleSwitchHref,
  normalizeHashFragment,
  setPendingLocaleSwitchHash,
} from "./LanguageSwitcherUtils";
import {
  defaultLocale,
  isValidLocale,
  locales,
  type AppLocale,
} from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useTransition } from "react";

const flagByLocale: Record<AppLocale, { src: string }> = {
  en: {
    src: "/flags/UKFlag.svg",
  },
  nl: {
    src: "/flags/NLFlag.svg",
  },
  ka: {
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

  useEffect(() => {
    // This instance is a fresh mount after the [locale] segment remounted, so
    // the pending hash lives in module scope (see LanguageSwitcherUtils).
    // Only consume it once the URL reflects the target locale.
    const [, pathLocale] = window.location.pathname.split("/");

    if (pathLocale !== locale) {
      return;
    }

    const pendingHash = consumePendingLocaleSwitchHash(locale);

    if (pendingHash === null) {
      return;
    }

    // next-intl locale navigation rebuilds the href from pathname/query, so the fragment is dropped.
    // Restore it with replaceState so the locale switch keeps one history entry while preserving the anchor.
    if (window.location.hash !== pendingHash) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}${pendingHash}`,
      );
    }
  }, [locale, pathname]);

  const handleToggleLocale = () => {
    const currentHash = normalizeHashFragment(window.location.hash);
    const nextHref = getLocaleSwitchHref(pathname, window.location.search);

    startLocaleTransition(() => {
      setPendingLocaleSwitchHash(currentHash, nextLocale);

      router.replace(nextHref, {
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
          alt=""
          width={20}
          height={20}
          className="size-5"
        />
      </span>
    </GlyphButton>
  );
}

export default LanguageSwitcher;
