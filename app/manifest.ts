import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TeachX",
    short_name: "TeachX",
    description: "Learn, teach, and earn with an AI powered education platform.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    orientation: "portrait",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
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
        name: "Student Workspace",
        short_name: "Student",
        url: "/student"
      },
      {
        name: "Marketplace",
        short_name: "Market",
        url: "/marketplace"
      }
    ]
  };
}
