import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TeachX Guru",
    short_name: "TeachX",
    description: "The professional AI workspace for teachers.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "en-IN",
    dir: "ltr",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    orientation: "portrait",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    shortcuts: [
      {
        name: "Teacher Workspace",
        short_name: "Teacher",
        url: "/teacher"
      },
      {
        name: "Marketplace",
        short_name: "Market",
        url: "/marketplace"
      }
    ]
  };
}
