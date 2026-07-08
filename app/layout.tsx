import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Providers from "./providers"; // Importe o novo componente

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "STP Market - Compra e Venda em São Tomé e Príncipe",
  description:
    "Encontre as melhores ofertas em veículos, imóveis, eletrônicos e muito mais em São Tomé e Príncipe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
