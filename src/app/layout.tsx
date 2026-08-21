import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BottomTabBar } from "@/components/shell/bottom-tab-bar";
import { DemoDataBanner } from "@/components/demo-data-banner";
import { DonorProvider } from "@/lib/donor-store";
import { ToastProvider } from "@/components/ui/toast";
import { IS_DEMO_DATA } from "@/lib/data";

/** Uber Move is proprietary; these are the closest free equivalents. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500"],
  variable: "--font-frank-ruhl",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shaare Tzadaka — find a Jewish tzedaka organization",
    template: "%s · Shaare Tzadaka",
  },
  description:
    "A free directory of Jewish tzedaka organizations. Browse by category, city or need, see how each one is verified, and give directly to the organization. We never handle your donation and never take a cut.",
  openGraph: {
    type: "website",
    siteName: "Shaare Tzadaka",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, title: "Shaare Tzadaka", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // Next serialises this into a meta tag, so it cannot read a CSS variable.
  // It is --blue-900. Change both together.
  themeColor: "#062B5C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${frankRuhl.variable}`}
    >
      <body className="min-h-dvh bg-ink-050">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <ToastProvider>
          <DonorProvider>
            {IS_DEMO_DATA && <DemoDataBanner />}

            {/*
              The tab bar is fixed, so main reserves its height plus the safe
              area. Without this the last card sits under the bar and nobody
              can reach it.
            */}
            <main
              id="main"
              className="mx-auto min-h-dvh max-w-app bg-white pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom))]"
            >
              {children}
            </main>

            <BottomTabBar />
          </DonorProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
