"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  className?: string;
}

export function ShareButton({
  url,
  title,
  text,
  className,
}: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Veja este anúncio",
          text: text || "Encontrei este produto no Mercado STP",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Não foi possível partilhar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isLoading || !url}
      className={
        className ||
        "inline-flex h-12 items-center justify-center rounded-md border border-[#cfe2d5] px-5 text-sm font-bold text-[#0b3b2f] transition hover:bg-[#e7f5ee] disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {isLoading ? "A partilhar..." : "Partilhar"}
    </button>
  );
}
