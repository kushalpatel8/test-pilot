import type { Metadata } from "next";
import { Tenor_Sans, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const tenorSans = Tenor_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tenor-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Test Pilot",
  description: "Automated GitHub repository testing and analysis platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
    <html
      lang="en"
      className={`${tenorSans.variable} ${geistMono.variable} ${tenorSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
    </ClerkProvider>
  );
}
