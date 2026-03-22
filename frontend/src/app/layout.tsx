import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import DynamicBranding from "@/components/DynamicBranding";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import BrandedBadge from "@/components/BrandedBadge";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Advocate Pro",
  description: "Management System for Advocates",
  icons: [
    {
      rel: "icon",
      url: "/logo%20without%20background.png",
    },
    {
      rel: "shortcut icon",
      url: "/logo%20without%20background.png",
    },
    {
      rel: "apple-touch-icon",
      url: "/logo%20without%20background.png",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${notoDevanagari.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <DynamicBranding />
        <SubscriptionGuard>
          {children}
        </SubscriptionGuard>
        <BrandedBadge />
      </body>
    </html>
  );
}
