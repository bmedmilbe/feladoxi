"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

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
  const { tr } = useLanguage();

  const handleShare = async () => {
    setIsLoading(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || tr("Veja este anúncio", "View this listing"),
          text: text || tr("Encontrei este produto no Mercado STP", "I found this product on Mercado STP"),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(tr("Link copiado", "Link copied"));
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error(tr("Não foi possível partilhar", "Unable to share"));
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
      {isLoading ? tr("A partilhar...", "Sharing...") : tr("Partilhar", "Share")}
    </button>
  );
}
