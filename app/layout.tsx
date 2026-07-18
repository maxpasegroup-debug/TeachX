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
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "TeachX Guru is an AI powered teaching and learning ecosystem where teachers create, students learn, and knowledge grows into opportunity.";
const baseUrl = getPublicBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: "TeachX Guru",
  title: {
    default: appTitle,
    template: `%s | ${appTitle}`
  },
  description: appDescription,
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
