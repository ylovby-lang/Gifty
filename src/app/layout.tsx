// ============================================================================
// gifty.by · Корневой layout (Next.js 16 App Router)
// ============================================================================
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "gifty.by — конструктор подарков",
  description:
    "Конструктор зон печати для персонализации подарков на gifty.by",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${rubik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
