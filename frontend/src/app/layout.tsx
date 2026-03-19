import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DynamicBranding from "@/components/DynamicBranding";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import BrandedBadge from "@/components/BrandedBadge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
