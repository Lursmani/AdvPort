import { defaultLocale, locales, type AppLocale } from "@/i18n/config";

export const siteUrl = "https://davitl.com";
// Social share preview image (Open Graph / Twitter). Served from /public.
export const ogImagePath = "/images/og-image.jpg";
// Browser-chrome (meta theme-color) and PWA manifest colors. These mirror the
// light/dark `--background` theme tokens in src/app/globals.scss — the token
// source of truth — and must be updated together with them.
export const themeBackgroundColors = {
  light: "#faf9f9",
  dark: "#001219",
} as const;
export const siteName = "Davit Lursmanashvili";
export const siteTitles: Record<AppLocale, string> = {
  en: "Davit Lursmanashvili | Software Developer",
  nl: "Davit Lursmanashvili | Softwareontwikkelaar",
  ka: "დავით ლურსმანაშვილი | დეველოპერი",
};
export const siteJobTitles: Record<AppLocale, string> = {
  en: "Software Developer",
  nl: "Softwareontwikkelaar",
  ka: "დეველოპერი",
};

export const siteSameAs = [
  "https://www.linkedin.com/in/davit-lursmanashvili/",
  "https://github.com/Lursmani",
];

export const siteEmail = "lursmanashvilidavit@gmail.com";

export const siteDescriptions: Record<AppLocale, string> = {
  en: "Portfolio of Davit Lursmanashvili, a software developer building polished, high-performance web experiences.",
  nl: "Portfolio van Davit Lursmanashvili, een softwareontwikkelaar die verzorgde en snelle webervaringen bouwt.",
  ka: "დავით ლურსმანაშვილის პორტფოლიო — დეველოპერი, რომელიც ქმნის დახვეწილ და სწრაფ ვებგამოცდილებებს.",
};

export const localeLanguageTags: Record<AppLocale, string> = {
  en: "en-US",
  nl: "nl-NL",
  ka: "ka-GE",
};

export const localeOpenGraphTags: Record<AppLocale, string> = {
  en: "en_US",
  nl: "nl_NL",
  ka: "ka_GE",
};

export function getLocalePath(locale: AppLocale) {
  return `/${locale}`;
}

// hreflang → URL map shared by generateMetadata (relative URLs) and the
// sitemap (absolute URLs, pass `siteUrl`), including the x-default fallback,
// so the two stay structurally identical.
export function buildLanguageAlternates(baseUrl = ""): Record<string, string> {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [
        localeLanguageTags[locale],
        `${baseUrl}${getLocalePath(locale)}`,
      ]),
    ),
    "x-default": `${baseUrl}${getLocalePath(defaultLocale)}`,
  };
}
