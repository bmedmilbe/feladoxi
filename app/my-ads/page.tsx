"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { enGB, pt } from "date-fns/locale";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { deleteAd, fetchAds, fetchCategories } from "@/lib/api";
import {
  DistrictLabels,
  type Ad,
  type ApiResponse,
  type Category,
} from "@/types";

type AdStatus = Ad["status"];
type StatusFilter = AdStatus | "ALL";

const statusLabels: Record<AdStatus, string> = {
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  EXPIRED: "Expirado",
};

const statusStyles: Record<AdStatus, string> = {
  ACTIVE: "border-[#b9dec9] bg-[#e7f5ee] text-[#0b6a4c]",
  SUSPENDED: "border-[#edd9a0] bg-[#fff8df] text-[#806112]",
  EXPIRED: "border-[#efc1b8] bg-[#fff0ec] text-[#a33a2a]",
};

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "ACTIVE", label: "Ativos" },
  { value: "SUSPENDED", label: "Suspensos" },
  { value: "EXPIRED", label: "Expirados" },
];

function SearchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function formatPrice(price: string | null, language: "pt" | "en") {
  if (!price) return language === "en" ? "Price negotiable" : "Preço a combinar";
  return new Intl.NumberFormat(language === "en" ? "en-GB" : "pt-ST", {
    style: "currency",
    currency: "STN",
    maximumFractionDigits: 2,
  }).format(Number(price));
}

export default function MyAdsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, tr, categoryName } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<Ad["id"] | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: categories } = useQuery<ApiResponse<Category>>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: isAuthenticated,
  });

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

  const ownedAds = useMemo(() => {
    if (!user) return [];
    return (allAds?.results || []).filter((ad) => ad.customer.id === user.id);
  }, [allAds?.results, user]);

  const filteredAds = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return ownedAds.filter((ad) => {
      const matchesStatus =
        selectedStatus === "ALL" || ad.status === selectedStatus;
      const matchesCategory =
        selectedCategory === "ALL" ||
        String(ad.category?.id || "") === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        ad.product_name.toLowerCase().includes(normalizedSearch) ||
        (ad.description || "").toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [ownedAds, searchTerm, selectedCategory, selectedStatus]);

  const stats = useMemo(
    () => ({
      total: ownedAds.length,
      active: ownedAds.filter((ad) => ad.status === "ACTIVE").length,
      suspended: ownedAds.filter((ad) => ad.status === "SUSPENDED").length,
      expired: ownedAds.filter((ad) => ad.status === "EXPIRED").length,
    }),
    [ownedAds],
  );

  const deleteMutation = useMutation({
    mutationFn: deleteAd,
    onMutate: (adId: Ad["id"]) => setDeletingId(adId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-ads"] });
      toast.success(tr("Anúncio removido com sucesso", "Listing removed successfully"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || tr("Não foi possível remover o anúncio", "Unable to remove the listing"));
    },
    onSettled: () => setDeletingId(null),
  });

  const handleDelete = (ad: Ad) => {
    const confirmed = window.confirm(
      tr(`Remover o anúncio "${ad.product_name}"? Esta ação não pode ser anulada.`, `Remove the listing "${ad.product_name}"? This action cannot be undone.`),
    );
    if (confirmed) deleteMutation.mutate(ad.id);
  };

  const handleCopyLink = async (adId: Ad["id"]) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/ads/${adId}`);
      toast.success(tr("Link do anúncio copiado", "Listing link copied"));
    } catch {
      toast.error(tr("Não foi possível copiar o link", "Unable to copy the link"));
    }
  };

  const clearFilters = () => {
    setSelectedStatus("ALL");
    setSelectedCategory("ALL");
    setSearchTerm("");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f4fbf6]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isError) {
    return (
      <div className="bg-[#f4fbf6] px-4 py-16">
        <div className="mx-auto max-w-xl">
          <EmptyState
            title={tr("Não foi possível carregar os anúncios", "Unable to load your listings")}
            description={tr("Verifique a ligação e tente novamente.", "Check your connection and try again.")}
            actionText={tr("Tentar novamente", "Try again")}
            actionOnClick={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const hasFilters = Boolean(
    selectedStatus !== "ALL" ||
      selectedCategory !== "ALL" ||
      searchTerm.trim(),
  );

  return (
    <div className="min-h-[70vh] bg-[#f4fbf6]">
      <section className="border-b border-[#d8e7dc] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-9 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e7492f]">
              {tr("Área do vendedor", "Seller area")}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-[#07382d] sm:text-5xl">
              {tr("Meus anúncios", "My listings")}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#52685f]">
              {tr("Acompanhe a sua vitrine, atualize fotografias e partilhe os produtos.", "Manage your showcase, update photos and share your products.")}
            </p>
          </div>
          <Link
            href="/ads/create"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-md bg-[#e7492f] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(231,73,47,0.18)] transition hover:bg-[#c83e27]"
          >
            {tr("Novo anúncio", "New listing")}
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
        <section className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#d8e7dc] bg-white shadow-[0_12px_30px_rgba(14,42,35,0.06)] md:grid-cols-4">
          {[
            { label: tr("Total", "Total"), value: stats.total },
            { label: tr("Ativos", "Active"), value: stats.active },
            { label: tr("Suspensos", "Suspended"), value: stats.suspended },
            { label: tr("Expirados", "Expired"), value: stats.expired },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`px-5 py-4 ${
                index % 2 === 0 ? "border-r" : ""
              } ${index < 2 ? "border-b md:border-b-0" : ""} border-[#edf4ef] md:border-r md:last:border-r-0`}
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6d8179]">
                {item.label}
              </p>
              <p className="mt-1 text-3xl font-black text-[#0b2f27]">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-lg border border-[#d8e7dc] bg-white p-4 shadow-[0_12px_30px_rgba(14,42,35,0.05)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_auto_220px] lg:items-end">
            <div>
              <label htmlFor="my-ads-search" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]">
                {tr("Pesquisar", "Search")}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6d8179]">
                  <SearchIcon />
                </span>
                <input
                  id="my-ads-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={tr("Nome ou descrição do produto", "Product name or description")}
                  className="h-11 w-full rounded-md border border-[#cfe2d5] bg-[#f8fcf9] pl-12 pr-4 text-sm text-[#173a32] outline-none focus:border-[#0b8a5f] focus:ring-4 focus:ring-[#0b8a5f]/10"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#52685f]">
                {tr("Estado", "Status")}
              </p>
              <div className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-[#edf7f1] p-1">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setSelectedStatus(filter.value)}
                    aria-pressed={selectedStatus === filter.value}
                    className={`h-9 whitespace-nowrap rounded-md px-3 text-xs font-bold transition ${
                      selectedStatus === filter.value
                        ? "bg-[#0b2f27] text-white shadow-sm"
                        : "text-[#52685f] hover:bg-white"
                    }`}
                  >
                    {language === "en"
                      ? ({ ALL: "All", ACTIVE: "Active", SUSPENDED: "Suspended", EXPIRED: "Expired" } as Record<StatusFilter, string>)[filter.value]
                      : filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="my-ads-category" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#52685f]">
                {tr("Categoria", "Category")}
              </label>
              <select
                id="my-ads-category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="h-11 w-full rounded-md border border-[#cfe2d5] bg-white px-3 text-sm font-semibold text-[#173a32] outline-none focus:border-[#0b8a5f] focus:ring-4 focus:ring-[#0b8a5f]/10"
              >
                <option value="ALL">{tr("Todas as categorias", "All categories")}</option>
                {categories?.results?.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {categoryName(category.slug, category.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#52685f]">
            {filteredAds.length} {language === "en" ? (filteredAds.length === 1 ? "listing" : "listings") : (filteredAds.length === 1 ? "anúncio" : "anúncios")}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-bold text-[#0b6a4c] hover:text-[#e7492f]"
            >
              {tr("Limpar filtros", "Clear filters")}
            </button>
          )}
        </div>

        {filteredAds.length > 0 ? (
          <div className="mt-4 grid gap-4">
            {filteredAds.map((ad) => {
              const imageUrl = ad.images?.[0]?.image_url;
              const district = ad.customer.district === "UNKNOWN"
                ? tr("Distrito não informado", "District not provided")
                : DistrictLabels[ad.customer.district] || ad.customer.district;

              return (
                <article
                  key={ad.id}
                  className="overflow-hidden rounded-lg border border-[#d8e7dc] bg-white shadow-[0_12px_30px_rgba(14,42,35,0.05)] transition hover:border-[#b8d6c1] hover:shadow-[0_16px_38px_rgba(14,42,35,0.09)]"
                >
                  <div className="grid sm:grid-cols-[190px_minmax(0,1fr)]">
                    <Link
                      href={`/ads/${ad.id}`}
                      className="relative block aspect-[4/3] bg-[#edf7f1] sm:aspect-auto sm:min-h-[190px]"
                      aria-label={`${tr("Ver", "View")} ${ad.product_name}`}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={ad.product_name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 100vw, 190px"
                        />
                      ) : (
                        <div className="flex h-full min-h-[170px] flex-col items-center justify-center px-4 text-center text-[#6d8179]">
                          <span className="text-sm font-bold">{tr("Sem fotografia", "No photo")}</span>
                          <span className="mt-1 text-xs">{tr("Adicione uma na edição", "Add one when editing")}</span>
                        </div>
                      )}
                      {ad.is_featured && (
                        <span className="absolute left-3 top-3 rounded-md bg-[#fff3bf] px-2 py-1 text-xs font-bold text-[#725500] shadow-sm">
                          {tr("Destaque", "Featured")}
                        </span>
                      )}
                    </Link>

                    <div className="min-w-0 p-4 sm:p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[ad.status]}`}>
                              {language === "en" ? ({ ACTIVE: "Active", SUSPENDED: "Suspended", EXPIRED: "Expired" } as Record<AdStatus, string>)[ad.status] : statusLabels[ad.status]}
                            </span>
                            {ad.category && (
                              <span className="text-xs font-semibold text-[#6d8179]">{categoryName(ad.category.slug, ad.category.name)}</span>
                            )}
                          </div>
                          <Link href={`/ads/${ad.id}`} className="mt-3 block truncate text-xl font-black text-[#0b2f27] transition hover:text-[#e7492f]">
                            {ad.product_name}
                          </Link>
                          {ad.description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#52685f]">{ad.description}</p>
                          )}
                        </div>
                        <p className="shrink-0 text-lg font-black text-[#0b6a4c]">{formatPrice(ad.price, language)}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#edf4ef] pt-4 text-xs font-semibold text-[#6d8179]">
                        <span>{district}</span>
                        <span>
                          {tr("Criado", "Created")} {formatDistanceToNow(new Date(ad.created_at), { addSuffix: true, locale: language === "en" ? enGB : pt })}
                        </span>
                        <span>{tr("Expira em", "Expires on")} {format(new Date(ad.expires_at), "dd/MM/yyyy")}</span>
                        <span>{ad.images?.length || 0} {language === "en" ? ((ad.images?.length || 0) === 1 ? "photo" : "photos") : ((ad.images?.length || 0) === 1 ? "foto" : "fotos")}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/my-ads/${ad.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-md bg-[#0b2f27] px-4 text-sm font-bold text-white transition hover:bg-[#0b6a4c]"
                        >
                          {tr("Editar", "Edit")}
                        </Link>
                        <Link
                          href={`/ads/${ad.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-md border border-[#cfe2d5] px-4 text-sm font-bold text-[#0b3b2f] transition hover:bg-[#e7f5ee]"
                        >
                          {tr("Ver anúncio", "View listing")}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(ad.id)}
                          className="grid h-10 w-10 place-items-center rounded-md border border-[#cfe2d5] text-[#0b3b2f] transition hover:bg-[#e7f5ee]"
                          aria-label={tr(`Copiar link de ${ad.product_name}`, `Copy link for ${ad.product_name}`)}
                          title={tr("Copiar link", "Copy link")}
                        >
                          <CopyIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ad)}
                          disabled={deletingId === ad.id}
                          className="ml-auto grid h-10 w-10 place-items-center rounded-md border border-[#efc1b8] text-[#a33a2a] transition hover:bg-[#fff0ec] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`${tr("Remover", "Remove")} ${ad.product_name}`}
                          title={tr("Remover anúncio", "Remove listing")}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title={hasFilters ? tr("Nenhum anúncio encontrado", "No listings found") : tr("Ainda não tem anúncios", "You do not have any listings yet")}
              description={
                hasFilters
                  ? tr("Altere ou limpe os filtros para ver outros produtos.", "Change or clear the filters to see other products.")
                  : tr("Crie o primeiro anúncio e comece a vender no Mercado STP.", "Create your first listing and start selling on Mercado STP.")
              }
              actionText={hasFilters ? tr("Limpar filtros", "Clear filters") : tr("Criar anúncio", "Create listing")}
              actionLink={hasFilters ? undefined : "/ads/create"}
              actionOnClick={hasFilters ? clearFilters : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
