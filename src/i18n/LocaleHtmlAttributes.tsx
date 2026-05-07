"use client";

import { useEffect } from "react";

type LocaleHtmlAttributesProps = {
  locale: string;
};

export default function LocaleHtmlAttributes({
  locale,
}: LocaleHtmlAttributesProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
