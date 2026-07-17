"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NotFoundContent, {
  notFoundLinkClassName,
} from "@/components/NotFoundContent";

// Rendered within the locale layout, so NextIntlClientProvider is available.
// not-found.tsx does not receive params, so the locale comes from context via
// useTranslations and the localized Link from @/i18n/navigation.
export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <NotFoundContent
      title={t("title")}
      description={t("description")}
      link={
        <Link href="/" className={notFoundLinkClassName}>
          {t("backHome")}
        </Link>
      }
    />
  );
}
