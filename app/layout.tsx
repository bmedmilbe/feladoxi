import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Mercado STP | Mercado online de São Tomé e Príncipe",
  description:
    "Compre e venda produtos em São Tomé e Príncipe. Buy and sell products across São Tomé and Príncipe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-ST">
      <body className="bg-[#f6fafb] pb-[76px] text-[#082f4f] lg:pb-0">
        <Providers>
          <Navigation />
          <main className="min-h-[60vh] bg-[#f6fafb]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
