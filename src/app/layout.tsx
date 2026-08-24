import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/components/user-provider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "TheAuctus — Automated Creator Growth Engine",
  description:
    "Automate your content planning, publishing, and audience growth with AI. Schedule 30 days of content in minutes, not hours.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col editorial-bg">
        <ThemeProvider>
          <UserProvider>
            <div className="relative z-10 flex-1 flex flex-col">
              {children}
            </div>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
