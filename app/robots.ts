import type { MetadataRoute } from "next";

import { getPublicBaseUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/welcome", "/teachers", "/save-time", "/earn-more", "/learn-more", "/enjoy-more", "/tara", "/pricing", "/trust", "/status", "/privacy", "/terms", "/security", "/cookies", "/refund-policy", "/contact", "/marketplace", "/resources", "/.well-known/security.txt"],
        disallow: ["/admin", "/teacher", "/student", "/api", "/dashboard", "/settings", "/profile"]
      }
    ],
    sitemap: `${getPublicBaseUrl()}/sitemap.xml`
  };
}
