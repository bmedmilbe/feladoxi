// app/my-ads/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchAds, deleteAd, fetchCategories } from "@/lib/api";
import { Ad, ApiResponse, Category } from "@/types";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import toast from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";
import { pt } from "date-fns/locale";

type AdStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED";

const statusLabels: Record<AdStatus, string> = {
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  EXPIRED: "Expirado",
};

const statusColors: Record<AdStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-yellow-100 text-yellow-800",
  EXPIRED: "bg-red-100 text-red-800",
};

const statusBadgeIcons: Record<AdStatus, string> = {
  ACTIVE: "✅",
  SUSPENDED: "⏸️",
  EXPIRED: "⏰",
};

export default function MyAdsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<AdStatus | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch categories for filter
  const { data: categories } = useQuery<ApiResponse<Category>>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: isAuthenticated,
  });

  // Fetch user's ads
  const {
    data: allAds,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<Ad>>({
    queryKey: ["my-ads"],
    queryFn: () => fetchAds({ search: "", category: "", district: "" }),
    enabled: isAuthenticated,
  });

  // Filter ads by status and category
  const filteredAds = allAds?.results?.filter((ad) => {
    const statusMatch =
      selectedStatus === "ALL" || ad.status === selectedStatus;
    const categoryMatch =
      selectedCategory === "ALL" ||
      (ad.category && String(ad.category.id) === selectedCategory);
    return statusMatch && categoryMatch;
  });

  // Stats
  const stats = {
    total: allAds?.results?.length || 0,
    active: allAds?.results?.filter((ad) => ad.status === "ACTIVE").length || 0,
    suspended:
      allAds?.results?.filter((ad) => ad.status === "SUSPENDED").length || 0,
    expired:
      allAds?.results?.filter((ad) => ad.status === "EXPIRED").length || 0,
  };

  // Delete ad mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-ads"] });
      toast.success("Anúncio removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erro ao remover anúncio");
    },
  });

  const handleDelete = (id: number, productName: string) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover o anúncio "${productName}"?`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/ads/edit/${id}`);
  };

  const handleStatusChange = (status: AdStatus | "ALL") => {
    setSelectedStatus(status);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Erro ao carregar seus anúncios</p>
        <button onClick={() => refetch()} className="btn-primary">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Anúncios</h1>
          <p className="text-gray-500 mt-1">
            Gerencie todos os seus anúncios em um só lugar
          </p>
        </div>
        <Link
          href="/ads/create"
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
        >
          <span>➕</span>
          Novo Anúncio
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suspensos</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.suspended}
              </p>
            </div>
            <span className="text-3xl">⏸️</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expirados</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <span className="text-3xl">⏰</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange("ALL")}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedStatus === "ALL"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-300 hover:border-blue-400"
                }`}
              >
                Todos
              </button>
              {Object.entries(statusLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key as AdStatus)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center gap-1 ${
                    selectedStatus === key
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <span>{statusBadgeIcons[key as AdStatus]}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="ALL">Todas</option>
              {categories?.results?.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.icon || "📁"} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ads List */}
      {filteredAds && filteredAds.length > 0 ? (
        <div className="space-y-4">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
                  {ad.images && ad.images.length > 0 ? (
                    <Image
                      src={ad.images[0].image_url}
                      alt={ad.product_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  {/* Featured Badge */}
                  {ad.is_featured && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                        ⭐ Destaque
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/ads/${ad.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {ad.product_name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ad.status as AdStatus]}`}
                          >
                            {statusBadgeIcons[ad.status as AdStatus]}{" "}
                            {statusLabels[ad.status as AdStatus]}
                          </span>
                          {ad.category && (
                            <span className="text-xs text-gray-500">
                              {ad.category.icon || "📁"} {ad.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {ad.price && (
                        <span className="text-lg font-bold text-blue-600">
                          {new Intl.NumberFormat("pt-ST", {
                            style: "currency",
                            currency: "STN",
                          }).format(Number(ad.price))}
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    {ad.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {ad.description}
                      </p>
                    )}

                    {/* Timestamps */}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                      <span>
                        Criado{" "}
                        {formatDistanceToNow(new Date(ad.created_at), {
                          addSuffix: true,
                          locale: pt,
                        })}
                      </span>
                      <span>
                        Expira {format(new Date(ad.expires_at), "dd/MM/yyyy")}
                      </span>
                      <span>📍 {ad.customer.district}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/ads/${ad.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      👁️ Ver
                    </Link>
                    <Link
                      href={`/my-ads/${ad.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(ad.id, ad.product_name)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      🗑️ Remover
                    </button>
                    {ad.status === "ACTIVE" && (
                      <button
                        onClick={() => {
                          // Copy link to clipboard
                          const url = `${window.location.origin}/ads/${ad.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success(
                            "Link copiado para a área de transferência!",
                          );
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                      >
                        📋 Copiar Link
                      </button>
                    )}
                    {ad.status === "EXPIRED" && (
                      <span className="text-xs text-red-500 ml-2">
                        Este anúncio expirou e não está mais visível
                      </span>
                    )}
                    {ad.status === "SUSPENDED" && (
                      <span className="text-xs text-yellow-500 ml-2">
                        Este anúncio foi suspenso
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            selectedStatus !== "ALL"
              ? `Nenhum anúncio ${statusLabels[selectedStatus as AdStatus].toLowerCase()}`
              : "Você ainda não tem anúncios"
          }
          description={
            selectedStatus !== "ALL"
              ? `Você não tem anúncios com status "${statusLabels[selectedStatus as AdStatus]}"`
              : "Crie seu primeiro anúncio e comece a vender hoje mesmo!"
          }
          actionText="Criar Anúncio"
          actionLink="/ads/create"
        />
      )}
    </div>
  );
}
