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

  const {
    data: ad,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["ad", id],
    queryFn: () => fetchAd(id),
    enabled: !isNaN(id),
  });

  if (isNaN(id)) {
    return (
      <EmptyState
        title="Invalid Ad ID"
        description="The ad ID provided is invalid"
        actionText="Go Home"
        actionLink="/"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !ad) {
    return (
      <EmptyState
        title="Ad Not Found"
        description="The listing you're looking for doesn't exist or has been removed"
        actionText="Browse Listings"
        actionLink="/"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdDetail ad={ad} />
    </div>
  );
}
