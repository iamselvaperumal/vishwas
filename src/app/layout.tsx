import type { Metadata, Viewport } from "next";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { siteConfig } from "@/config/site";
import { satoshi } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  description: siteConfig.description,
  icons: {
    icon: "./favicon.ico",
    shortcut: "./favicon-32x32.png",
    apple: "./apple-touch-icon.png",
  },
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "relative h-full min-h-screen bg-background font-satoshi leading-6 tracking-[.2px] antialiased",
            satoshi.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
              {children}
              <Toaster richColors expand position="bottom-right" />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
