import { defaultLocale, isValidLocale, type AppLocale } from "@/i18n/config";
import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "use-intl";

const messageLoaders: Record<
  AppLocale,
  () => Promise<{ default: AbstractIntlMessages }>
> = {
  en: () => import("../../messages/en.json"),
  nl: () => import("../../messages/nl.json"),
  ka: () => import("../../messages/ka.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale =
    requestedLocale && isValidLocale(requestedLocale)
      ? requestedLocale
      : defaultLocale;

  return {
    locale,
    messages: (await messageLoaders[locale]()).default,
  };
});
