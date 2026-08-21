// app/ads/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdDetail } from "@/components/AdDetail";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { fetchAd } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function AdDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { tr } = useLanguage();

  const { data: ad, isLoading, isError } = useQuery({
    queryKey: ["ad", id],
    queryFn: () => fetchAd(id),
    enabled: !isNaN(id),
  });

  if (isNaN(id)) {
    return (
      <EmptyState
        title={tr("Anúncio inválido", "Invalid listing")}
        description={tr("O identificador deste anúncio não é válido.", "This listing identifier is not valid.")}
        actionText={tr("Voltar ao mercado", "Return to marketplace")}
        actionLink="/"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f4fbf6]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !ad) {
    return (
      <EmptyState
        title={tr("Anúncio não encontrado", "Listing not found")}
        description={tr("Este anúncio não existe ou já foi removido.", "This listing does not exist or has already been removed.")}
        actionText={tr("Ver outros produtos", "View other products")}
        actionLink="/"
      />
    );
  }

  return <AdDetail ad={ad} />;
}
