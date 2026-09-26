import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { I18nProvider } from "@/context/i18n-context";
import { UserProvider } from "@/context/user-context";
import { PageTransition } from "@/components/layout/page-transition";
import { AnimatePresence } from "framer-motion";
import { NavbarWrapper, FooterWrapper } from "@/components/layout/nav-footer-wrapper";

export const metadata: Metadata = {
  title: "Business Bridge | BUY. SELL. GROW.",
  description: "Discover, evaluate, buy and sell online businesses and digital assets through a trusted marketplace.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Business Bridge",
    description: "Global Acquisition Marketplace",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans overflow-x-hidden">
        <I18nProvider>
          <UserProvider>
            <NavbarWrapper />
            <main className="flex-1 w-full overflow-x-hidden">
              <AnimatePresence mode="wait">
                  <PageTransition>
                  {children}
                  </PageTransition>
              </AnimatePresence>
            </main>
            <FooterWrapper />
          </UserProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
