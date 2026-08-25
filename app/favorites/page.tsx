"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdCard } from "@/components/AdCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useLanguage } from "@/context/LanguageContext";

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    favorites,
    favoriteCount,
    isLoading,
    refreshFavorites,
  } = useFavorites();
  const { tr } = useLanguage();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/auth/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || hasRefreshed.current) return;
    hasRefreshed.current = true;
    void refreshFavorites();
  }, [isAuthenticated, isLoading, refreshFavorites]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f4fbf6]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="bg-[#f4fbf6]">
      <div className="mx-auto min-h-[65vh] max-w-[1536px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#078b8d]">
          {tr("A sua seleção", "Your selection")}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-black text-[#082f4f] sm:text-4xl">
            {tr("Produtos favoritos", "Favourite products")}
          </h1>
          <span className="rounded-full bg-[#e4f7f7] px-3 py-1 text-sm font-bold text-[#078b8d]">
            {languageCount(favoriteCount, tr)}
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title={tr("Ainda não tem favoritos", "No favourites yet")}
              description={tr(
                "Use o coração nos produtos para guardar os anúncios que pretende consultar novamente.",
                "Use the heart on products to save listings you want to view again.",
              )}
              actionText={tr("Explorar produtos", "Explore products")}
              actionLink="/#produtos"
            />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((ad) => (
              <AdCard key={ad.id} ad={ad} featured={ad.is_featured} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function languageCount(
  count: number,
  tr: (ptText: string, enText: string) => string,
) {
  return tr(
    `${count} favorito${count === 1 ? "" : "s"}`,
    `${count} favourite${count === 1 ? "" : "s"}`,
  );
}
