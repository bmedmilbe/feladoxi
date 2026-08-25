"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { enGB } from "date-fns/locale";
import { DistrictLabels, Ad, ConditionLabels, AdCondition } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

interface AdCardProps {
  ad: Ad;
  featured?: boolean;
}

const categoryFallbackImages: Record<string, string> = {
  cacau: "/images/category-local-products.png",
  cafe: "/images/category-local-products.png",
  "produtos-agricolas": "/images/category-local-products.png",
  computadores: "/images/category-electronics.png",
  electronica: "/images/category-electronics.png",
  acessorios: "/images/category-electronics.png",
  consolas: "/images/category-electronics.png",
  calcado: "/images/category-fashion.png",
  moda: "/images/category-fashion.png",
};

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 7.7c.3-.6.7-.6 1-.6h.4l.8 2c.1.3 0 .5-.2.7l-.6.7c-.2.2-.1.5 0 .7.7 1.2 1.7 2.1 3 2.7.3.1.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.4.4.6 0 .6-.3 1.5-1 1.9-.6.4-1.4.6-2.3.3-1.1-.3-2.5-.8-4.1-2.2-1.3-1.1-2.2-2.5-2.5-3.6-.3-1.1 0-2.1.4-2.7.2-.1.4-.1.6-.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden="true">
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function getWhatsAppContactUrl(ad: Ad, message: string) {
  const digits = ad.customer.mobile_number.replace(/\D/g, "");
  const baseUrl = ad.customer.whatsapp_link?.startsWith("http")
    ? ad.customer.whatsapp_link.split("?")[0]
    : `https://wa.me/${digits}`;
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

export function AdCard({ ad, featured = false }: AdCardProps) {
  const { language, tr, categoryName } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(ad.id);
  const isFeatured = featured || ad.is_featured_active;
  const isOnSale = ad.is_on_sale && Boolean(ad.original_price && ad.price);
  const priceFormatter = new Intl.NumberFormat(
    language === "en" ? "en-GB" : "pt-ST",
    { style: "currency", currency: "STN" },
  );
  const categoryFallback = ad.category?.slug
    ? categoryFallbackImages[ad.category.slug]
    : null;
  const primaryImage =
    ad.images?.[0]?.image_url || categoryFallback;
  const hasProductImage = Boolean(ad.images?.[0]?.image_url);
  const districtCode = ad.customer.district;
  const originalDistrictLabel = DistrictLabels[districtCode as keyof typeof DistrictLabels] || districtCode;
  const districtLabel = districtCode === "UNKNOWN"
    ? tr("Distrito não informado", "District not provided")
    : language === "en" && districtCode === "DIASPORA"
      ? "Diaspora"
      : originalDistrictLabel;
  const originalConditionLabel = ad.condition
    ? ConditionLabels[ad.condition as AdCondition]
    : null;
  const englishConditions: Record<string, string> = { NEW: "New", USED: "Used", IMPORTED: "Imported", LOCAL: "Made in São Tomé" };
  const conditionLabel = language === "en" && ad.condition ? englishConditions[ad.condition] : originalConditionLabel;
  const whatsappUrl = getWhatsAppContactUrl(
    ad,
    tr(
      `Olá, vi o anúncio "${ad.product_name}" no Mercado STP. Ainda está disponível?`,
      `Hello, I saw the listing "${ad.product_name}" on Mercado STP. Is it still available?`,
    ),
  );

  return (
    <article
      className={`group relative h-full overflow-hidden rounded-lg border bg-white shadow-[0_14px_32px_rgba(7,52,79,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(7,52,79,0.14)] ${
        isFeatured ? "border-[#08a6a6]" : "border-[#dceaf0]"
      }`}
    >
      <Link href={`/ads/${ad.id}`} className="block h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#dbe9df]">
          <div className="absolute inset-0 grid place-content-center gap-3 bg-[#dcece3] text-center text-[#42665b]">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#bad7df] bg-white/70 text-3xl font-black text-[#082f4f]">
              {ad.category?.name?.charAt(0) || "M"}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.14em]">
              {tr("Sem fotografia", "No photo")}
            </span>
          </div>

          {primaryImage && (
            <Image
              src={primaryImage}
              alt={ad.product_name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`transition duration-500 group-hover:scale-105 ${
                hasProductImage ? "bg-white object-contain" : "object-cover"
              }`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
          {primaryImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b2f27]/44 via-transparent to-transparent opacity-80" />
          )}

          {conditionLabel && (
            <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#173a32] shadow-sm sm:bottom-3 sm:left-3 sm:px-3 sm:text-xs">
              {conditionLabel}
            </span>
          )}
          {isOnSale && (
            <span className="absolute left-2 top-2 rounded-md bg-[#e7492f] px-2 py-1 text-[10px] font-black text-white shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
              -{ad.discount_percentage}%
            </span>
          )}
          {ad.is_demo && (
            <span className={`absolute left-2 rounded-md bg-[#ffd23f] px-2 py-1 text-[10px] font-black uppercase text-[#082f4f] shadow-sm sm:left-3 sm:px-3 sm:text-xs ${isOnSale ? "top-10 sm:top-12" : "top-2 sm:top-3"}`}>
              {tr("Demonstração", "Demo")}
            </span>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="min-w-0 truncate rounded-full bg-[#e4f7f7] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#078b8d] sm:px-3 sm:text-xs sm:tracking-[0.12em]">
              {ad.category ? categoryName(ad.category.slug, ad.category.name) : tr("Sem categoria", "Uncategorised")}
            </span>
            {isFeatured && (
              <span className="hidden rounded-full bg-[#ffd23f] px-3 py-1 text-xs font-bold text-[#082f4f] sm:inline-flex">
                {tr("Destaque", "Featured")}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 text-[#082f4f] sm:min-h-[3.25rem] sm:text-lg sm:leading-snug">
            {ad.product_name}
          </h3>

          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#657d8d] sm:mt-3 sm:gap-1.5 sm:text-sm">
            <PinIcon />
            <span className="truncate">{districtLabel}</span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-2 border-t border-[#edf4ef] pt-3 sm:mt-4 sm:gap-3 sm:pt-4">
            <div>
              {isOnSale && (
                <p className="text-[10px] font-semibold leading-tight text-[#7b8c86] line-through sm:text-xs">
                  {priceFormatter.format(Number(ad.original_price))}
                </p>
              )}
              {ad.price && (
                <p className={`text-base font-black leading-tight sm:text-xl ${isOnSale ? "text-[#e7492f]" : "text-[#082f4f]"}`}>
                  {priceFormatter.format(Number(ad.price))}
                </p>
              )}
              <p className="mt-1 hidden text-xs text-[#6d8179] sm:block">
                {formatDistanceToNow(new Date(ad.created_at), {
                  addSuffix: true,
                  locale: language === "en" ? enGB : pt,
                })}
              </p>
            </div>
            <span className="hidden text-sm font-bold text-[#078b8d] sm:inline">{tr("Ver", "View")}</span>
          </div>
        </div>
      </Link>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-[#138256] text-white shadow-[0_10px_22px_rgba(19,130,86,0.3)] transition hover:scale-105 hover:bg-[#0f6c48] sm:right-3 sm:top-3 sm:h-11 sm:w-11"
        aria-label={tr(`Contactar fornecedor de ${ad.product_name} no WhatsApp`, `Contact the supplier of ${ad.product_name} on WhatsApp`)}
        title={tr("Contactar no WhatsApp", "Contact on WhatsApp")}
      >
        <WhatsAppIcon />
      </a>
      {isAuthenticated && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(ad);
          }}
          className={`absolute right-2 top-12 z-10 grid h-9 w-9 place-items-center rounded-full border shadow-[0_10px_22px_rgba(7,52,79,0.18)] transition hover:scale-105 sm:right-3 sm:top-16 sm:h-11 sm:w-11 ${
            favorite
              ? "border-[#e7492f] bg-[#e7492f] text-white"
              : "border-white/80 bg-white/95 text-[#e7492f] hover:bg-[#fff0ec]"
          }`}
          aria-label={
            favorite
              ? tr(`Remover ${ad.product_name} dos favoritos`, `Remove ${ad.product_name} from favourites`)
              : tr(`Adicionar ${ad.product_name} aos favoritos`, `Add ${ad.product_name} to favourites`)
          }
          aria-pressed={favorite}
          title={favorite ? tr("Remover dos favoritos", "Remove from favourites") : tr("Adicionar aos favoritos", "Add to favourites")}
        >
          <HeartIcon filled={favorite} />
        </button>
      )}
    </article>
  );
}
