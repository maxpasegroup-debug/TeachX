import type { MetadataRoute } from "next";

import { getPublicBaseUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/welcome", "/teachers", "/students", "/marketplace", "/resources"],
        disallow: ["/admin", "/teacher", "/student", "/api", "/dashboard", "/settings", "/profile"]
      }
    ],
    sitemap: `${getPublicBaseUrl()}/sitemap.xml`
  };
}
