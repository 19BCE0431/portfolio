import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: "https://mohitsaikrishna.in/sitemap.xml",
    host: "https://mohitsaikrishna.in",
  };
}
