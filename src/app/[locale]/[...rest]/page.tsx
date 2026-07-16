import { notFound } from "next/navigation";

// Any unmatched path under a locale prefix (e.g. /en/does-not-exist) renders
// the localized not-found boundary in src/app/[locale]/not-found.tsx.
export default function CatchAllPage() {
  notFound();
}
