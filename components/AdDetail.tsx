"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { enGB, pt } from "date-fns/locale";
import { ShareButton } from "@/components/ShareButton";
import {
  ConditionLabels,
  DistrictLabels,
  type Ad,
  type AdCondition,
} from "@/types";
import { useLanguage, type Language } from "@/context/LanguageContext";

interface AdDetailProps {
  ad: Ad;
}

const statusStyles = {
  ACTIVE: "border-[#b9dec9] bg-[#e7f5ee] text-[#0b6a4c]",
  SUSPENDED: "border-[#edd9a0] bg-[#fff8df] text-[#806112]",
  EXPIRED: "border-[#efc1b8] bg-[#fff0ec] text-[#a33a2a]",
};

function formatPrice(price: string | null, language: Language) {
  if (!price) return language === "en" ? "Price on request" : "Preço a combinar";
  return new Intl.NumberFormat(language === "en" ? "en-GB" : "pt-ST", {
    style: "currency",
    currency: "STN",
    maximumFractionDigits: 2,
  }).format(Number(price));
}

function LocationIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function GalleryArrowIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg className={`h-5 w-5 ${direction === "next" ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdDetail({ ad }: AdDetailProps) {
  const { language, tr, categoryName } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [shareUrl, setShareUrl] = useState("");
  const images = ad.images || [];
  const currentImage = images[selectedImage]?.image_url;
  const originalDistrictLabel = DistrictLabels[ad.customer.district] || ad.customer.district;
  const districtLabel = ad.customer.district === "UNKNOWN"
    ? tr("Distrito não informado", "District not provided")
    : language === "en" && ad.customer.district === "DIASPORA"
      ? "Diaspora"
      : originalDistrictLabel;
  const originalConditionLabel = ad.condition
    ? ConditionLabels[ad.condition as AdCondition]
    : null;
  const englishConditions: Record<string, string> = { NEW: "New", USED: "Used", IMPORTED: "Imported", LOCAL: "Made in São Tomé" };
  const conditionLabel = language === "en" && ad.condition ? englishConditions[ad.condition] : originalConditionLabel;
  const statusLabels = language === "en"
    ? { ACTIVE: "Available", SUSPENDED: "Suspended", EXPIRED: "Inactive" }
    : { ACTIVE: "Disponível", SUSPENDED: "Suspenso", EXPIRED: "Inativo" };
  const isAvailable = ad.status === "ACTIVE";
  const isFeatured = ad.is_featured_active;
  const isOnSale = ad.is_on_sale && Boolean(ad.original_price && ad.price);

  const showPreviousImage = () => {
    setSelectedImage((current) => (current - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    setSelectedImage((current) => (current + 1) % images.length);
  };

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleWhatsAppClick = () => {
    if (!isAvailable) return;

    const digits = ad.customer.mobile_number.replace(/\D/g, "");
    const contactUrl = new URL(
      ad.customer.whatsapp_link?.startsWith("http")
        ? ad.customer.whatsapp_link.split("?")[0]
        : `https://wa.me/${digits}`,
    );
    contactUrl.searchParams.set(
      "text",
      tr(
        `Olá! Tenho interesse no produto "${ad.product_name}" anunciado no Mercado STP: ${window.location.href}`,
        `Hello! I am interested in the product "${ad.product_name}" listed on Mercado STP: ${window.location.href}`,
      ),
    );
    window.open(contactUrl.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-[#f4fbf6] text-[#0b2f27]">
      <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pb-16">
        <nav className="flex min-w-0 items-center gap-2 overflow-hidden text-sm font-semibold text-[#6d8179]" aria-label={tr("Navegação estrutural", "Breadcrumb navigation")}>
          <Link href="/" className="shrink-0 transition hover:text-[#e7492f]">{tr("Mercado", "Marketplace")}</Link>
          <span aria-hidden="true">/</span>
          {ad.category && (
            <>
              <Link href={`/?category=${encodeURIComponent(ad.category.slug)}`} className="shrink-0 transition hover:text-[#e7492f]">
                {categoryName(ad.category.slug, ad.category.name)}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span className="truncate text-[#0b2f27]">{ad.product_name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] lg:gap-12">
          <section className="min-w-0" aria-label={tr("Fotografias do produto", "Product photos")}>
            <div className="relative aspect-square overflow-hidden rounded-lg border border-[#d8e7dc] bg-[#e8f0ed] shadow-[0_16px_40px_rgba(14,42,35,0.07)] lg:aspect-[4/3]">
              {currentImage ? (
                <>
                  <Image
                    src={currentImage}
                    alt=""
                    fill
                    aria-hidden="true"
                    className="scale-110 object-cover opacity-30 blur-2xl"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                  <span className="absolute inset-0 bg-white/50" aria-hidden="true" />
                  <Image
                    src={currentImage}
                    alt={`${ad.product_name}, ${tr("fotografia", "photo")} ${selectedImage + 1}`}
                    fill
                    priority
                    className="z-[1] object-contain p-2 sm:p-4"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center text-[#6d8179]">
                  <p className="font-serif text-2xl font-semibold text-[#0b2f27]">{tr("Sem fotografia", "No photo")}</p>
                  <p className="mt-2 max-w-sm text-sm leading-6">{tr("O vendedor ainda não adicionou imagens a este produto.", "The seller has not added images to this product yet.")}</p>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/90 text-[#082f4f] shadow-[0_8px_24px_rgba(7,52,79,0.18)] backdrop-blur transition hover:bg-white sm:left-4 sm:h-11 sm:w-11"
                    aria-label={tr("Fotografia anterior", "Previous photo")}
                    title={tr("Fotografia anterior", "Previous photo")}
                  >
                    <GalleryArrowIcon direction="previous" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/90 text-[#082f4f] shadow-[0_8px_24px_rgba(7,52,79,0.18)] backdrop-blur transition hover:bg-white sm:right-4 sm:h-11 sm:w-11"
                    aria-label={tr("Fotografia seguinte", "Next photo")}
                    title={tr("Fotografia seguinte", "Next photo")}
                  >
                    <GalleryArrowIcon direction="next" />
                  </button>
                </>
              )}

              {isFeatured && (
                <span className="absolute left-3 top-3 z-10 rounded-md bg-[#fff3bf] px-3 py-1.5 text-xs font-black text-[#725500] shadow-sm sm:left-4 sm:top-4">
                  {tr("Produto em destaque", "Featured product")}
                </span>
              )}
              {images.length > 0 && (
                <span className="absolute bottom-3 right-3 z-10 rounded-md bg-[#071f1b]/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur sm:bottom-4 sm:right-4">
                  {selectedImage + 1} {tr("de", "of")} {images.length}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`${tr("Ver fotografia", "View photo")} ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-[#edf3f1] transition sm:h-24 sm:w-24 ${
                      selectedImage === index
                        ? "border-[#08a6a6] shadow-[0_6px_18px_rgba(8,166,166,0.18)]"
                        : "border-[#d8e7dc] hover:border-[#0b8a5f]"
                    }`}
                  >
                    <Image src={image.image_url} alt="" fill className="object-contain p-1" sizes="96px" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              {ad.is_demo && (
                <span className="rounded-full border border-[#e8bd22] bg-[#fff3bf] px-3 py-1 text-xs font-black text-[#725500]">
                  {tr("Produto de demonstração", "Demo product")}
                </span>
              )}
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusStyles[ad.status]}`}>
                {statusLabels[ad.status]}
              </span>
              {ad.category && (
                <Link
                  href={`/?category=${encodeURIComponent(ad.category.slug)}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0b6a4c] transition hover:text-[#e7492f]"
                >
                  {categoryName(ad.category.slug, ad.category.name)}
                </Link>
              )}
              {conditionLabel && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#52685f]">{conditionLabel}</span>
              )}
            </div>

            <h1 className="mt-5 break-words font-serif text-4xl font-semibold leading-tight text-[#07382d] sm:text-5xl">
              {ad.product_name}
            </h1>
            <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
              {isOnSale && (
                <p className="text-lg font-bold text-[#7b8c86] line-through sm:text-xl">
                  {formatPrice(ad.original_price, language)}
                </p>
              )}
              <p className="text-3xl font-black text-[#e7492f] sm:text-4xl">{formatPrice(ad.price, language)}</p>
              {isOnSale && (
                <span className="mb-1 rounded-md bg-[#ffe8df] px-2.5 py-1 text-sm font-black text-[#b53828]">
                  -{ad.discount_percentage}%
                </span>
              )}
            </div>

            {ad.description ? (
              <div className="mt-6 border-t border-[#d8e7dc] pt-5">
                <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[#52685f]">{tr("Descrição", "Description")}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#52685f]">{ad.description}</p>
              </div>
            ) : (
              <p className="mt-5 text-sm italic text-[#6d8179]">{tr("O vendedor não adicionou uma descrição.", "The seller did not add a description.")}</p>
            )}

            <dl className="mt-6 grid gap-3 border-y border-[#d8e7dc] py-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 shrink-0 text-[#0b6a4c]"><LocationIcon /></span>
                <div className="min-w-0">
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#6d8179]">{tr("Localização", "Location")}</dt>
                  <dd className="mt-1 truncate text-sm font-bold text-[#0b2f27]">{districtLabel}</dd>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 shrink-0 text-[#0b6a4c]"><ClockIcon /></span>
                <div className="min-w-0">
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#6d8179]">{tr("Publicado", "Published")}</dt>
                  <dd className="mt-1 text-sm font-bold text-[#0b2f27]">
                    {formatDistanceToNow(new Date(ad.created_at), { addSuffix: true, locale: language === "en" ? enGB : pt })}
                  </dd>
                </div>
              </div>
            </dl>

            {!isAvailable && (
              <div className="mt-5 rounded-md border border-[#efc1b8] bg-[#fff0ec] px-4 py-3 text-sm font-semibold text-[#a33a2a]">
                {tr("Este produto não está disponível para novos pedidos.", "This product is not available for new enquiries.")}
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                disabled={!isAvailable}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#159455] px-5 text-sm font-black text-white transition hover:bg-[#107843] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MessageIcon />
                {tr("Contactar no WhatsApp", "Contact on WhatsApp")}
              </button>
            </div>
            <ShareButton
              url={shareUrl}
              title={ad.product_name}
              text={tr(`Veja ${ad.product_name} no Mercado STP`, `View ${ad.product_name} on Mercado STP`)}
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md border border-[#cfe2d5] bg-white px-5 text-sm font-bold text-[#0b3b2f] transition hover:bg-[#e7f5ee] disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="mt-7 border-t border-[#d8e7dc] pt-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#52685f]">{tr("Vendedor", "Seller")}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0b2f27] text-sm font-black text-white">
                  ST
                </span>
                <div className="min-w-0">
                  <a href={`tel:${ad.customer.mobile_number}`} className="block truncate text-sm font-black text-[#0b2f27] hover:text-[#e7492f]">
                    {ad.customer.mobile_number}
                  </a>
                  <p className="mt-1 text-xs font-semibold text-[#6d8179]">{districtLabel}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-10 grid gap-4 border-t border-[#d8e7dc] pt-8 sm:grid-cols-3" aria-label={tr("Boas práticas de compra", "Safe buying practices")}>
          {[
            [tr("Confirme o produto", "Confirm the product"), tr("Solicite detalhes e confirme o estado antes de fechar o pedido.", "Ask for details and confirm the condition before making a deal.")],
            [tr("Fale diretamente", "Talk directly"), tr("Use o WhatsApp do fornecedor para tirar dúvidas antes de decidir.", "Use the seller's WhatsApp to ask questions before deciding.")],
            [tr("Marque com segurança", "Meet safely"), tr("Prefira pontos conhecidos e confirme sempre a identidade do anunciante.", "Prefer known locations and always confirm the seller's identity.")],
          ].map(([title, description]) => (
            <div key={title} className="border-l-2 border-[#e7492f] pl-4">
              <h2 className="text-sm font-black text-[#0b2f27]">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-[#52685f]">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
