// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdCard } from "@/components/AdCard";
import { SearchFilters } from "@/components/SearchFilters";
import { CategoryGrid } from "@/components/CategoryGrid";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { HeroSection } from "@/components/HeroSection";
import { fetchAds, fetchCategories } from "@/lib/api";
import type { Ad, Category, FilterState } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    district: searchParams.get("district") || "",
    condition: searchParams.get("condition") || "",
  });
  const { hasPendingAd, pendingAdData, clearPendingAd } = useAuth();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.district) params.set("district", filters.district);
    if (filters.condition) params.set("condition", filters.condition);
    router.push(`/?${params.toString()}`);
  }, [filters, router]);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Fetch ads with filters
  const {
    data: ads,
    isLoading,
    isError,
    refetch,
  } = useQuery<Ad[]>({
    queryKey: ["ads", filters],
    queryFn: () => fetchAds(filters),
  });

  // Separate featured and regular ads
  const featuredAds = ads?.results?.filter((ad) => ad.is_featured) || [];
  const regularAds = ads?.results?.filter((ad) => !ad.is_featured) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Erro ao carregar anúncios</p>
        <button onClick={() => refetch()} className="btn-primary">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <>
      {hasPendingAd && pendingAdData && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Você tem um rascunho de anúncio aguardando publicação
                </p>
                <p className="text-xs text-yellow-600">
                  &quot;{pendingAdData.product_name}&quot; - Faça login para
                  publicar
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Publicar Agora
              </Link>
              <button
                onClick={clearPendingAd}
                className="text-sm text-yellow-600 hover:text-yellow-800 transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Quick Links */}
        {!filters.search &&
          !filters.category &&
          !filters.district &&
          !filters.condition && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Explorar Categorias
              </h2>
              <CategoryGrid categories={categories?.results || []} />
            </div>
          )}

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilters
            filters={filters}
            onFilterChange={setFilters}
            categories={categories?.results || []}
          />
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            {ads?.results?.length || 0} anúncio
            {ads?.results?.length !== 1 ? "s" : ""} encontrado
            {ads?.results?.length !== 1 ? "s" : ""}
          </h2>
          <span className="text-sm text-gray-500">
            {featuredAds.length > 0 && `${featuredAds.length} em destaque`}
          </span>
        </div>

        {/* Ads Grid */}
        {ads?.results && ads?.results?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Featured Ads First */}
            {featuredAds.map((ad) => (
              <div key={ad.id} className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    ⭐ Destaque
                  </span>
                </div>
                <AdCard ad={ad} featured />
              </div>
            ))}
            {/* Regular Ads */}
            {regularAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum anúncio encontrado"
            description="Tente ajustar seus filtros de busca ou crie um novo anúncio"
            actionText="Criar Anúncio"
            actionLink="/create-ad"
          />
        )}
      </div>
    </>
  );
}
