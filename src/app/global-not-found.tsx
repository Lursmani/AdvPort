import Link from "next/link";
import { rootHtmlClassName } from "@/app/fonts";
import NotFoundContent, {
  notFoundLinkClassName,
} from "@/components/NotFoundContent";
import "./globals.scss";

// Rendered when a request matches no route at all — including an invalid locale
// segment, where the [locale] layout throws notFound() before its intl provider
// mounts, so the localized src/app/[locale]/not-found.tsx cannot render. This
// file bypasses all layouts, so it declares its own <html>/<body> and imports
// global styles directly. It is intentionally non-localized (English), since no
// locale is resolvable on this path. There is no ThemeProvider here, so
// data-theme="dark" is set statically: it matches the :root token defaults and
// makes the tokens that only exist under html[data-theme=...] (e.g.
// --header-background, used by .hero-glass) resolve.
export const metadata = {
  title: "Page not found",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme="dark" className={rootHtmlClassName}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NotFoundContent
          title="Page not found"
          description="The page you're looking for doesn't exist."
          link={
            <Link href="/" className={notFoundLinkClassName}>
              Back to home
            </Link>
          }
        />
      </body>
    </html>
  );
}
