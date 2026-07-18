import type { MetadataRoute } from "next";

import { getPublicBaseUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getPublicBaseUrl();
  const now = new Date();

  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/welcome`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/resources`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 }
  ];
}
