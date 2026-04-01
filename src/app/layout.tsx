import type { Metadata } from "next";
import { Baloo_Thambi_2, Poppins } from "next/font/google";
import "./globals.css";

const heading = Baloo_Thambi_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const body = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cascade Dashboard",
  description: "Intern dashboard — Rederij Cascade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`h-full antialiased ${heading.variable} ${body.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
