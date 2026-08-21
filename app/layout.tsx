import type { Metadata } from "next";
import { cookies } from "next/headers";

import "./globals.css";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { PrivacyChoices } from "@/components/privacy/privacy-choices";
import { getPublicBaseUrl } from "@/lib/env";
import { CONTRAST_COOKIE, LOCALE_COOKIE, MOTION_COOKIE, resolveLocale, resolveTimeZone, TIME_ZONE_COOKIE } from "@/lib/i18n/config";

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
    icon: [{ url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }, { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" }]
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const timeZone = resolveTimeZone(cookieStore.get(TIME_ZONE_COOKIE)?.value);
  const motion = cookieStore.get(MOTION_COOKIE)?.value === "reduce" ? "reduce" : "system";
  const contrast = cookieStore.get(CONTRAST_COOKIE)?.value === "high" ? "high" : "standard";

  return (
    <html data-contrast={contrast} data-motion={motion} data-time-zone={timeZone} dir={locale.direction} lang={locale.code}>
      <body className="font-sans antialiased">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div id="main-content" tabIndex={-1}>{children}</div>
        <PwaInstallPrompt />
        <PrivacyChoices hasChoice={cookieStore.has("teachx_privacy")} />
      </body>
    </html>
  );
}
