import {
  siteDescriptions,
  siteEmail,
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
  jobTitle: string;
  description: string;
  email: string;
  sameAs: string[];
  knowsAbout: string[];
}

/**
 * Serialize a schema for embedding in a `<script type="application/ld+json">`.
 * `<script>` content is raw text, so a literal `</script` sequence in any field
 * would terminate the element and let the tail parse as markup (XSS). Escaping
 * `<` to its JSON `<` unicode escape is JSON-legal and HTML-inert, closing
 * the breakout while the data is still static — before dynamic values arrive.
 */
export function serializeJsonLd(schema: PersonSchema): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export function generatePersonJsonLd(locale: AppLocale): PersonSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteName,
    url: `${siteUrl}/${locale}`,
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
