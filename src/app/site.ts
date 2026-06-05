import type { AppLocale } from "@/i18n/config";

export const siteUrl = "https://davitl.com";
export const siteName = "Davit Lursmanashvili";
export const siteTitle = "Davit Lursmanashvili | Software Developer";
export const siteImagePath = "/images/davit ski.jpg";

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
