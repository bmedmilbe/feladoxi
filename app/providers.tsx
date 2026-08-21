"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                border: "1px solid #d8e7dc",
                borderRadius: "6px",
                background: "#0b2f27",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                padding: "12px 14px",
              },
              success: {
                iconTheme: { primary: "#4ade80", secondary: "#0b2f27" },
              },
              error: {
                iconTheme: { primary: "#ff8a75", secondary: "#0b2f27" },
              },
            }}
          />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}
