"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { ShareButton } from "@/components/ShareButton";
import {
  ConditionLabels,
  DistrictLabels,
  type Ad,
  type AdCondition,
} from "@/types";

interface AdDetailProps {
  ad: Ad;
}

const statusLabels = {
  ACTIVE: "Disponível",
  SUSPENDED: "Suspenso",
  EXPIRED: "Expirado",
};

const statusStyles = {
  ACTIVE: "border-[#b9dec9] bg-[#e7f5ee] text-[#0b6a4c]",
  SUSPENDED: "border-[#edd9a0] bg-[#fff8df] text-[#806112]",
  EXPIRED: "border-[#efc1b8] bg-[#fff0ec] text-[#a33a2a]",
};

function formatPrice(price: string | null) {
  if (!price) return "Preço a combinar";
  return new Intl.NumberFormat("pt-ST", {
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

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3v4m8-4v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export function AdDetail({ ad }: AdDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [shareUrl, setShareUrl] = useState("");
  const images = ad.images || [];
  const currentImage = images[selectedImage]?.image_url;
  const districtLabel =
    DistrictLabels[ad.customer.district] || ad.customer.district;
  const conditionLabel = ad.condition
    ? ConditionLabels[ad.condition as AdCondition]
    : null;
  const isAvailable = ad.status === "ACTIVE";

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
      `Olá! Tenho interesse no produto "${ad.product_name}" anunciado no Mercado STP: ${window.location.href}`,
    );
    window.open(contactUrl.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-[#f4fbf6] text-[#0b2f27]">
      <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pb-16">
        <nav className="flex min-w-0 items-center gap-2 overflow-hidden text-sm font-semibold text-[#6d8179]" aria-label="Navegação estrutural">
          <Link href="/" className="shrink-0 transition hover:text-[#e7492f]">Mercado</Link>
          <span aria-hidden="true">/</span>
          {ad.category && (
            <>
              <Link href={`/?category=${encodeURIComponent(ad.category.slug)}`} className="shrink-0 transition hover:text-[#e7492f]">
                {ad.category.name}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span className="truncate text-[#0b2f27]">{ad.product_name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] lg:gap-12">
          <section className="min-w-0" aria-label="Fotografias do produto">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-[#d8e7dc] bg-white shadow-[0_16px_40px_rgba(14,42,35,0.07)] sm:aspect-square lg:aspect-[4/3]">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={ad.product_name}
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center text-[#6d8179]">
                  <p className="font-serif text-2xl font-semibold text-[#0b2f27]">Sem fotografia</p>
                  <p className="mt-2 max-w-sm text-sm leading-6">O vendedor ainda não adicionou imagens a este produto.</p>
                </div>
              )}

              {ad.is_featured && (
                <span className="absolute left-4 top-4 rounded-md bg-[#fff3bf] px-3 py-1.5 text-xs font-black text-[#725500] shadow-sm">
                  Produto em destaque
                </span>
              )}
              {images.length > 0 && (
                <span className="absolute bottom-4 right-4 rounded-md bg-[#071f1b]/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                  {selectedImage + 1} de {images.length}
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
                    aria-label={`Ver fotografia ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-white transition ${
                      selectedImage === index
                        ? "border-[#e7492f]"
                        : "border-[#d8e7dc] hover:border-[#0b8a5f]"
                    }`}
                  >
                    <Image src={image.image_url} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusStyles[ad.status]}`}>
                {statusLabels[ad.status]}
              </span>
              {ad.category && (
                <Link
                  href={`/?category=${encodeURIComponent(ad.category.slug)}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0b6a4c] transition hover:text-[#e7492f]"
                >
                  {ad.category.name}
                </Link>
              )}
              {conditionLabel && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#52685f]">{conditionLabel}</span>
              )}
            </div>

            <h1 className="mt-5 break-words font-serif text-4xl font-semibold leading-tight text-[#07382d] sm:text-5xl">
              {ad.product_name}
            </h1>
            <p className="mt-4 text-3xl font-black text-[#e7492f] sm:text-4xl">{formatPrice(ad.price)}</p>

            {ad.description ? (
              <div className="mt-6 border-t border-[#d8e7dc] pt-5">
                <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[#52685f]">Descrição</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#52685f]">{ad.description}</p>
              </div>
            ) : (
              <p className="mt-5 text-sm italic text-[#6d8179]">O vendedor não adicionou uma descrição.</p>
            )}

            <dl className="mt-6 grid gap-3 border-y border-[#d8e7dc] py-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 shrink-0 text-[#0b6a4c]"><LocationIcon /></span>
                <div className="min-w-0">
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#6d8179]">Localização</dt>
                  <dd className="mt-1 truncate text-sm font-bold text-[#0b2f27]">{districtLabel}</dd>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 shrink-0 text-[#0b6a4c]"><ClockIcon /></span>
                <div className="min-w-0">
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#6d8179]">Publicado</dt>
                  <dd className="mt-1 text-sm font-bold text-[#0b2f27]">
                    {formatDistanceToNow(new Date(ad.created_at), { addSuffix: true, locale: pt })}
                  </dd>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 shrink-0 text-[#0b6a4c]"><CalendarIcon /></span>
                <div className="min-w-0">
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#6d8179]">Validade</dt>
                  <dd className="mt-1 text-sm font-bold text-[#0b2f27]">{format(new Date(ad.expires_at), "dd/MM/yyyy")}</dd>
                </div>
              </div>
            </dl>

            {!isAvailable && (
              <div className="mt-5 rounded-md border border-[#efc1b8] bg-[#fff0ec] px-4 py-3 text-sm font-semibold text-[#a33a2a]">
                Este produto não está disponível para novos pedidos.
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
                Contactar no WhatsApp
              </button>
            </div>
            <ShareButton
              url={shareUrl}
              title={ad.product_name}
              text={`Veja ${ad.product_name} no Mercado STP`}
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md border border-[#cfe2d5] bg-white px-5 text-sm font-bold text-[#0b3b2f] transition hover:bg-[#e7f5ee] disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="mt-7 border-t border-[#d8e7dc] pt-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#52685f]">Vendedor</p>
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

        <section className="mt-10 grid gap-4 border-t border-[#d8e7dc] pt-8 sm:grid-cols-3" aria-label="Boas práticas de compra">
          {[
            ["Confirme o produto", "Solicite detalhes e confirme o estado antes de fechar o pedido."],
            ["Fale diretamente", "Use o WhatsApp do fornecedor para tirar dúvidas antes de decidir."],
            ["Marque com segurança", "Prefira pontos conhecidos e confirme sempre a identidade do anunciante."],
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
