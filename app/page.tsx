// app/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdCard } from "@/components/AdCard";
import { SearchFilters } from "@/components/SearchFilters";
import { CategoryGrid } from "@/components/CategoryGrid";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { HeroSection } from "@/components/HeroSection";
import { SellerInvite } from "@/components/SellerInvite";
import { fetchAds, fetchCategories } from "@/lib/api";
import type { Ad, ApiResponse, Category, FilterState } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type SearchParamReader = {
  get: (key: string) => string | null;
};

function getFiltersFromSearchParams(
  searchParams: SearchParamReader,
): FilterState {
  return {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    district: searchParams.get("district") || "",
    condition: searchParams.get("condition") || "",
    featured: searchParams.get("featured") || "",
  };
}

function filtersAreEqual(first: FilterState, second: FilterState) {
  return (
    first.search === second.search &&
    first.category === second.category &&
    first.district === second.district &&
    (first.condition || "") === (second.condition || "") &&
    (first.featured || "") === (second.featured || "")
  );
}

const marketHighlights = [
  {
    title: "Produtos locais",
    description: "Descubra o que São Tomé tem para oferecer.",
  },
  {
    title: "WhatsApp direto",
    description: "Fale diretamente com cada fornecedor.",
  },
  {
    title: "Em todo o país",
    description: "Encontre anúncios de todos os distritos.",
  },
  {
    title: "Venda simples",
    description: "Publique o seu anúncio em poucos passos.",
  },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#078b8d]">
      {children}
    </p>
  );
}

function BenefitIcon({ index }: { index: number }) {
  const paths = [
    "M5 8h14l-1 12H6L5 8Zm4 0a3 3 0 0 1 6 0",
    "M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z",
    "M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z",
    "M4 6h16v12H4V6Zm4 4h8M8 14h5",
  ];

  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={paths[index % paths.length]} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-[#d8e7dc] bg-white shadow-[0_14px_32px_rgba(14,42,35,0.08)]"
        >
          <div className="aspect-[4/3] animate-pulse bg-[#dbe9df]" />
          <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
            <div className="h-4 w-24 animate-pulse rounded-full bg-[#dbe9df]" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-[#dbe9df]" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-[#dbe9df]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [filters, setFilters] = useState<FilterState>(() =>
    getFiltersFromSearchParams(searchParams),
  );
  const { hasPendingAd, pendingAdData, clearPendingAd } = useAuth();

  useEffect(() => {
    const urlFilters = getFiltersFromSearchParams(
      new URLSearchParams(searchParamsString),
    );

    setFilters((currentFilters) =>
      filtersAreEqual(currentFilters, urlFilters) ? currentFilters : urlFilters,
    );
  }, [searchParamsString]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.district) params.set("district", filters.district);
    if (filters.condition) params.set("condition", filters.condition);
    if (filters.featured) params.set("featured", filters.featured);

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `/?${nextQuery}#produtos` : "/";
    const currentQuery = window.location.search.replace(/^\?/, "");

    if (currentQuery !== nextQuery) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [filters, router]);

  const handleFilterChange = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    window.setTimeout(() => {
      document.getElementById("produtos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  // Fetch categories
  const { data: categories } = useQuery<ApiResponse<Category>>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Fetch ads with filters
  const {
    data: ads,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<Ad>>({
    queryKey: ["ads", filters],
    queryFn: () => fetchAds(filters),
  });

  useEffect(() => {
    if (isLoading || window.location.hash !== "#produtos") return;

    const timeout = window.setTimeout(() => {
      document.getElementById("produtos")?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [isLoading, searchParamsString]);

  // Separate featured and regular ads
  const featuredAds = ads?.results?.filter((ad) => ad.is_featured) || [];
  const regularAds = ads?.results?.filter((ad) => !ad.is_featured) || [];
  const adCount = ads?.results?.length || 0;
  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.district ||
    filters.condition ||
    filters.featured;

  return (
    <>
      {hasPendingAd && pendingAdData && (
        <div className="border-b border-[#ffd1a6] bg-[#fff2d8] py-3">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#08a6a6] text-sm font-bold text-white">
                AD
              </span>
              <div>
                <p className="text-sm font-bold text-[#4c3212]">
                  Tem um rascunho de anúncio aguardando publicação
                </p>
                <p className="text-xs text-[#6f4d1b]">
                  &quot;{pendingAdData.product_name}&quot; - faça login para
                  publicar
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="rounded-md bg-[#082f4f] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0b456e]"
              >
                Publicar agora
              </Link>
              <button
                onClick={clearPendingAd}
                className="text-sm font-semibold text-[#6f4d1b] transition-colors hover:text-[#082f4f]"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
      <HeroSection />

      <section className="hidden bg-white sm:block">
        <div className="mx-auto grid max-w-[1536px] gap-3 px-4 pb-5 sm:grid-cols-2 sm:px-6 xl:grid-cols-4 lg:px-8">
          {marketHighlights.map((highlight, index) => (
            <div key={highlight.title} className="flex min-h-[82px] items-center gap-4 rounded-lg border border-[#dceaf0] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(7,52,79,0.04)]">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#e4f7f7] text-[#078b8d]">
                <BenefitIcon index={index} />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-[#082f4f]">{highlight.title}</h2>
                <p className="mt-1 text-xs leading-5 text-[#657d8d]">{highlight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[1536px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {!hasActiveFilters && (
          <section id="categorias" className="mb-6 scroll-mt-32 sm:mb-10">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-5 sm:flex-row sm:items-end">
              <div>
                <SectionEyebrow>Descobrir agora</SectionEyebrow>
                <h2 className="mt-2 text-2xl font-black text-[#082f4f] sm:text-3xl">
                  Categorias em destaque
                </h2>
              </div>
              <p className="hidden max-w-md text-sm leading-6 text-[#657d8d] sm:block">
                Uma seleção de produtos locais, tecnologia, moda e oportunidades.
              </p>
            </div>
            <CategoryGrid categories={categories?.results || []} />
          </section>
        )}

        <section className="mb-5 sm:mb-8">
          <SearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories?.results || []}
          />
        </section>

        <div id="produtos" className="mb-6 scroll-mt-36">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <SectionEyebrow>Vitrine</SectionEyebrow>
              <h2 className="mt-2 text-2xl font-black text-[#082f4f] sm:text-3xl">
                {isLoading
                  ? "A carregar produtos"
                  : `${adCount} anúncio${adCount !== 1 ? "s" : ""} encontrado${
                      adCount !== 1 ? "s" : ""
                    }`}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#657d8d]">
              {featuredAds.length > 0 && (
                <span className="rounded-full bg-[#ffe8df] px-3 py-1 text-[#b53828]">
                  {featuredAds.length} em destaque
                </span>
              )}
              {hasActiveFilters && (
                <span className="rounded-full bg-[#e4f7f7] px-3 py-1 text-[#078b8d]">
                  Filtros ativos
                </span>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <ProductSkeletonGrid />
        ) : isError ? (
          <EmptyState
            title="Ainda não há anúncios disponíveis"
            description="A base de dados pode estar temporariamente indisponível. Tente novamente em poucos instantes."
            actionText="Tentar novamente"
            actionLink="/"
            actionOnClick={() => refetch()}
          />
        ) : ads?.results && adCount > 0 ? (
          <div className="space-y-10">
            {featuredAds.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-[#082f4f]">
                      Em destaque
                    </h3>
                    <p className="mt-1 text-sm text-[#657d8d]">
                      Produtos com maior visibilidade na plataforma.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {featuredAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} featured />
                  ))}
                </div>
              </section>
            )}

            {regularAds.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-[#082f4f]">
                      Mais anúncios
                    </h3>
                    <p className="mt-1 text-sm text-[#657d8d]">
                      Novidades publicadas por vendedores da comunidade.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {regularAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <EmptyState
            title="Nenhum anúncio encontrado"
            description="Tente ajustar os filtros de pesquisa ou crie um novo anúncio."
            actionText="Criar anúncio"
            actionLink="/ads/create"
          />
        )}

        <SellerInvite />
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-[#f4fbf6]">
          <LoadingSpinner />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
