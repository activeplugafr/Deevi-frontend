import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
