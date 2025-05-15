/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/layout.tsx
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aquatechnics Pool Proposals",
  description: "Interactive pool proposal viewer for Aquatechnics customers",
  icons: {
    icon: [
      { url: '/Favicon/favicon.ico', type: 'image/x-icon' },
      { url: '/Favicon/favicon.avif', type: 'image/avif' }
    ],
  },
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
        {children}
      </body>
    </html>
  );
}
