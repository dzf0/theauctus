import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/user-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import GalaxyBackground from "@/components/GalaxyBackground";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TheAuctus — Automated Creator Growth Engine",
  description:
    "Automate your content planning, publishing, and audience growth with AI. Schedule 30 days of content in minutes, not hours.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col editorial-bg">
        <ThemeProvider>
          <UserProvider>
            <GalaxyBackground />
            <div className="relative z-10 flex-1 flex flex-col">
              {children}
            </div>
            <CookieConsent />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
