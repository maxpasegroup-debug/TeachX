import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { getPublicBaseUrl } from "@/lib/env";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

const appTitle = process.env.NEXT_PUBLIC_APP_TITLE ?? "TeachX Guru";
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "TeachX Guru is the professional AI workspace for teachers to create lessons, manage resources, build their teaching profile, and grow their teaching business.";
const baseUrl = getPublicBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: "TeachX Guru",
  title: {
    default: appTitle,
    template: `%s | ${appTitle}`
  },
  description: appDescription,
  keywords: ["AI workspace for teachers", "teacher productivity", "AI lesson planner", "teaching resources", "teacher marketplace", "professional teaching profile", "teacher business tools"],
  alternates: {
    canonical: "/"
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TeachX Guru",
    statusBarStyle: "default"
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "TeachX Guru",
    title: appTitle,
    description: appDescription,
    images: [{ url: "/icons/icon.svg", width: 512, height: 512, alt: "TeachX Guru" }]
  },
  twitter: {
    card: "summary_large_image",
    title: appTitle,
    description: appDescription,
    images: ["/icons/icon.svg"]
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml" }]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased")}>
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
