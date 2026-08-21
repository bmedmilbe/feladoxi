// app/ads/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdDetail } from "@/components/AdDetail";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { fetchAd } from "@/lib/api";

export default function AdDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { data: ad, isLoading, isError } = useQuery({
    queryKey: ["ad", id],
    queryFn: () => fetchAd(id),
    enabled: !isNaN(id),
  });

  if (isNaN(id)) {
    return (
      <EmptyState
        title="Anúncio inválido"
        description="O identificador deste anúncio não é válido."
        actionText="Voltar ao mercado"
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
        title="Anúncio não encontrado"
        description="Este anúncio não existe ou já foi removido."
        actionText="Ver outros produtos"
        actionLink="/"
      />
    );
  }

  return <AdDetail ad={ad} />;
}
