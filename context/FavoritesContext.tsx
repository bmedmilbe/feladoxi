"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchAd } from "@/lib/api";
import type { Ad } from "@/types";

interface FavoritesContextType {
  favorites: Ad[];
  favoriteCount: number;
  isLoading: boolean;
  isFavorite: (adId: Ad["id"]) => boolean;
  toggleFavorite: (ad: Ad) => void;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

function storageKey(userId: number) {
  return `mercado_stp_favorites:${userId}`;
}

function sameId(first: Ad["id"], second: Ad["id"]) {
  return String(first) === String(second);
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { tr } = useLanguage();
  const [favorites, setFavorites] = useState<Ad[]>([]);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentStorageKey = user ? storageKey(user.id) : null;

  useEffect(() => {
    if (!isAuthenticated || !currentStorageKey) {
      setFavorites([]);
      setLoadedStorageKey(null);
      return;
    }

    try {
      const stored = window.localStorage.getItem(currentStorageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      setFavorites(Array.isArray(parsed) ? parsed : []);
    } catch {
      window.localStorage.removeItem(currentStorageKey);
      setFavorites([]);
    }
    setLoadedStorageKey(currentStorageKey);
  }, [currentStorageKey, isAuthenticated]);

  useEffect(() => {
    if (!currentStorageKey || loadedStorageKey !== currentStorageKey) return;
    window.localStorage.setItem(currentStorageKey, JSON.stringify(favorites));
  }, [currentStorageKey, favorites, loadedStorageKey]);

  const isFavorite = useCallback(
    (adId: Ad["id"]) => favorites.some((ad) => sameId(ad.id, adId)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (ad: Ad) => {
      if (!isAuthenticated) return;
      const alreadyFavorite = favorites.some((item) => sameId(item.id, ad.id));
      setFavorites((current) =>
        alreadyFavorite
          ? current.filter((item) => !sameId(item.id, ad.id))
          : [ad, ...current],
      );
      toast.success(
        alreadyFavorite
          ? tr("Produto removido dos favoritos", "Product removed from favourites")
          : tr("Produto adicionado aos favoritos", "Product added to favourites"),
      );
    },
    [favorites, isAuthenticated, tr],
  );

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated || favorites.length === 0) return;
    setIsRefreshing(true);
    try {
      const results = await Promise.allSettled(
        favorites.map((favorite) => fetchAd(favorite.id)),
      );
      setFavorites(
        results.flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        ),
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [favorites, isAuthenticated]);

  const value = useMemo(
    () => ({
      favorites,
      favoriteCount: favorites.length,
      isLoading:
        Boolean(isAuthenticated && currentStorageKey !== loadedStorageKey) ||
        isRefreshing,
      isFavorite,
      toggleFavorite,
      refreshFavorites,
    }),
    [
      currentStorageKey,
      favorites,
      isAuthenticated,
      isFavorite,
      isRefreshing,
      loadedStorageKey,
      refreshFavorites,
      toggleFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
}
