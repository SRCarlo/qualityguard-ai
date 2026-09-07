import type { Metadata } from "next";
import { Genos } from "next/font/google";
import "./globals.css";

const genos = Genos({
  variable: "--font-genos",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QualityGuard AI",
  description:
    "Multi-Agent Manufacturing Issue Triage Harness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${genos.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}