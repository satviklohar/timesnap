import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";

// Downloaded at build time and served from our own origin: visitors never contact Google.
const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "TimeSnap — think you can stop time?",
  description: "Hide the timer, trust your instincts, stop at exactly the right moment. Solo, multiplayer and challenge modes.",
  referrer: "no-referrer",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#F7F6F2" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Opt into per-request rendering so the CSP nonce set in proxy.ts is applied to every script.
  await connection();
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
