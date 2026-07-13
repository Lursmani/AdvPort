"use client";

import GlyphButton from "@/components/GlyphButton";
import {
  getLocaleSwitchHref,
  normalizeHashFragment,
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
import { useEffect, useRef, useTransition } from "react";

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
  // Only the locale switch started from this button may own a pending hash, and it must be cleared once.
  const pendingHashRef = useRef<string | null>(null);
  const currentLocale = isValidLocale(locale) ? locale : defaultLocale;
  const nextLocale =
    locales[(locales.indexOf(currentLocale) + 1) % locales.length];

  const nextLanguageLabel = t("actions.switchToLanguage", {
    language: t(`languages.${nextLocale}`),
  });

  useEffect(() => {
    const pendingHash = pendingHashRef.current;

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

    pendingHashRef.current = null;
  }, [locale, pathname]);

  const handleToggleLocale = () => {
    const currentHash = normalizeHashFragment(window.location.hash);
    const nextHref = getLocaleSwitchHref(pathname, window.location.search);

    startLocaleTransition(() => {
      pendingHashRef.current = currentHash;

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
