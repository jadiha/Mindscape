import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import NextAuthProvider from "@/components/NextAuthProvider";
import "./globals.css";

// Display font: elegant, organic, slightly botanical — perfect for calm UI
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Body font: warm, readable serif that pairs well with Cormorant
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mindscape",
  description: "A meditation for the moment you're in.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${lora.variable}`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
