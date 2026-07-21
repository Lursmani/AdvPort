import type { ReactNode } from "react";

// Presentational shell for src/app/[locale]/not-found.tsx. The back-home link
// is passed in as a node so callers control which Link component is used.
type NotFoundContentProps = {
  title: string;
  description: string;
  link: ReactNode;
};

export const notFoundLinkClassName =
  "hero-glass rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-foreground-soft transition-colors duration-300 hover:text-foreground";

function NotFoundContent({ title, description, link }: NotFoundContentProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-foreground-soft text-xs font-semibold uppercase tracking-eyebrow">
        404
      </p>
      <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
        {title}
      </h1>
      <p className="text-foreground-muted max-w-md text-base leading-7">
        {description}
      </p>
      {link}
    </main>
  );
}

export default NotFoundContent;
