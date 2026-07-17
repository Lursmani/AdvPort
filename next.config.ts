import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Defense-in-depth headers applied to every response. A restrictive CSP is
// intentionally omitted for now because the app emits inline scripts (JSON-LD
// and the next-themes bootstrap); adding one requires a nonce/hash strategy.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Strict-Transport-Security",
    // Scoped to this host only. `includeSubDomains`/`preload` are a
    // years-long, hard-to-reverse commitment that EVERY davitl.com subdomain
    // (mail, previews, third-party CNAMEs) serves valid HTTPS — only add them
    // back once that has been verified.
    value: "max-age=63072000",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["192.168.1.*", "localhost"],
  experimental: {
    // Enables src/app/global-not-found.tsx to serve a branded 404 even when the
    // request never reaches a locale layout (e.g. an invalid locale segment),
    // which this app's top-level [locale] dynamic root layout cannot compose.
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
