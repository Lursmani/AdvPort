import {
  siteDescriptions,
  siteEmail,
  siteImagePath,
  siteJobTitles,
  siteName,
  siteSameAs,
  siteUrl,
} from "@/app/site";
import type { AppLocale } from "@/i18n/config";

export interface PersonSchema {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  url: string;
  image: string;
  jobTitle: string;
  description: string;
  email: string;
  sameAs: string[];
  knowsAbout: string[];
}

export function generatePersonJsonLd(locale: AppLocale): PersonSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteName,
    url: `${siteUrl}/${locale}`,
    image: encodeURI(`${siteUrl}${siteImagePath}`),
    jobTitle: siteJobTitles[locale],
    description: siteDescriptions[locale],
    email: siteEmail,
    sameAs: siteSameAs,
    knowsAbout: [
      "Web Development",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Frontend Engineering",
      "UI/UX",
    ],
  };
}
