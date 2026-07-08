// components/ShareButton.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);
    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: title || "Confira este anúncio!",
          text: text || "Encontrei no STP Market",
          url: url,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch (error) {
      // User cancelled or error
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Falha ao compartilhar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      <span>📤</span>
      {isLoading ? "Compartilhando..." : "Compartilhar"}
    </button>
  );
}
