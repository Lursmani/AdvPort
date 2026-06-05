import type { MetadataRoute } from "next";
import { siteDescriptions, siteName, siteTitle } from "@/app/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteTitle,
    short_name: siteName,
    description: siteDescriptions.en,
    start_url: "/en",
    scope: "/",
    display: "standalone",
    background_color: "#001219",
    theme_color: "#001219",
    icons: [
      {
        src: "/file.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
