import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Geist = display / headings, Inter = body & controls (per the design system).
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Deevi — Find trusted artisans near you",
    template: "%s · Deevi",
  },
  description:
    "Deevi connects you with verified local artisans across Nigeria. Post what you need, compare artisans who apply, and hire with confidence.",
  applicationName: "Deevi",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Deevi", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#1b47d6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
