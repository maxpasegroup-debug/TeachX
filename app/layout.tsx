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

const appTitle = process.env.NEXT_PUBLIC_APP_TITLE ?? "TeachX";
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "Learn, teach, and earn with an AI powered education platform.";
const baseUrl = getPublicBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: "TeachX",
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
    title: "TeachX",
    statusBarStyle: "default"
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "TeachX",
    title: appTitle,
    description: appDescription
  },
  twitter: {
    card: "summary_large_image",
    title: appTitle,
    description: appDescription
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
