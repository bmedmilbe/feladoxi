"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useCart, type SellerCartGroup } from "@/context/CartContext";
import { DistrictLabels, type CustomerProfile } from "@/types";

interface BuyerDetails {
  name: string;
  phone: string;
}

interface StoredOrderProduct {
  adId: number;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
}

interface StoredSellerOrder {
  sellerId: number;
  mobileNumber: string;
  whatsappLink: string;
  district: string;
  products: StoredOrderProduct[];
  subtotal: number;
}

interface StoredOrder {
  id: string;
  buyer: BuyerDetails;
  sellers: StoredSellerOrder[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  status: "SAVED";
}

interface MessageProduct {
  name: string;
  quantity: number;
  unitPrice: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-ST", {
    style: "currency",
    currency: "STN",
  }).format(value);

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

function MinusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyCartIcon() {
  return (
    <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 8H6.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 21h.1M18 21h.1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function getWhatsAppUrl(
  seller: Pick<CustomerProfile, "mobile_number" | "whatsapp_link">,
  products: MessageProduct[],
  subtotal: number,
  buyer: BuyerDetails,
  orderId?: string,
) {
  const digits = seller.mobile_number.replace(/\D/g, "");
  const baseUrl = seller.whatsapp_link?.startsWith("http")
    ? seller.whatsapp_link.split("?")[0]
    : `https://wa.me/${digits}`;
  const lines = [
    "Olá, vi os seus produtos no Mercado STP.",
    orderId ? `Pedido: ${orderId}` : "",
    buyer.name.trim() ? `Cliente: ${buyer.name.trim()}` : "",
    buyer.phone.trim() ? `Contacto: ${buyer.phone.trim()}` : "",
    "",
    "Produtos:",
    ...products.map(
      (product) =>
        `- ${product.quantity}x ${product.name} (${formatCurrency(product.unitPrice)} cada)`,
    ),
    `Subtotal: ${formatCurrency(subtotal)}`,
  ].filter((line, index, allLines) => line || allLines[index - 1] !== "");

  return `${baseUrl}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function groupProductsForMessage(group: SellerCartGroup): MessageProduct[] {
  return group.items.map((item) => ({
    name: item.ad.product_name,
    quantity: item.quantity,
    unitPrice: Number(item.ad.price || 0),
  }));
}

function storedProductsForMessage(products: StoredOrderProduct[]): MessageProduct[] {
  return products.map((product) => ({
    name: product.productName,
    quantity: product.quantity,
    unitPrice: product.unitPrice,
  }));
}

function readStoredOrders(): StoredOrder[] {
  try {
    const stored = window.localStorage.getItem("stpmarket_orders");
    if (!stored) return [];
    const parsed = JSON.parse(stored) as StoredOrder[];
    return Array.isArray(parsed)
      ? parsed.filter((order) => Array.isArray(order.sellers))
      : [];
  } catch {
    return [];
  }
}

function SavedOrderView({ order, compact = false }: { order: StoredOrder; compact?: boolean }) {
  return (
    <div className={compact ? "" : "mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"}>
      <div className="border-l-4 border-[#18a66a] bg-white px-5 py-5 shadow-[0_14px_34px_rgba(14,42,35,0.08)] sm:px-7">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#138256]">
          Pedido guardado neste dispositivo
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[#07382d] sm:text-4xl">
          Agora contacte os anunciantes
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#52685f]">
          O pedido {order.id} ficou guardado. Envie uma mensagem a cada anunciante para confirmar disponibilidade.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {order.sellers.map((seller, index) => (
          <section
            key={`${seller.sellerId}-${seller.mobileNumber}`}
            className="rounded-lg border border-[#d8e7dc] bg-white p-5 shadow-[0_12px_30px_rgba(14,42,35,0.07)]"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#e7492f]">
                  Anunciante {index + 1}
                </p>
                <h2 className="mt-1 text-lg font-black text-[#0b2f27]">
                  {seller.mobileNumber}
                </h2>
                <p className="mt-1 text-sm text-[#60776e]">
                  {DistrictLabels[seller.district as keyof typeof DistrictLabels] || seller.district}
                </p>
              </div>
              <span className="rounded-full bg-[#e7f5ee] px-3 py-1 text-xs font-bold text-[#0b3b2f]">
                {seller.products.length} produto{seller.products.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-4 divide-y divide-[#edf4ef] border-y border-[#edf4ef]">
              {seller.products.map((product) => (
                <div key={product.adId} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-[#d8e7dc] bg-[#eef8f1] font-serif font-semibold text-[#0b3b2f]">
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt="" fill className="object-contain" sizes="44px" />
                      ) : (
                        product.productName.charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="truncate text-[#344f47]">
                      {product.quantity}x {product.productName}
                    </span>
                  </div>
                  <span className="shrink-0 font-bold text-[#0b2f27]">
                    {formatCurrency(product.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#60776e]">Subtotal</p>
                <p className="text-lg font-black text-[#0b3b2f]">{formatCurrency(seller.subtotal)}</p>
              </div>
              <a
                href={getWhatsAppUrl(
                  { mobile_number: seller.mobileNumber, whatsapp_link: seller.whatsappLink },
                  storedProductsForMessage(seller.products),
                  seller.subtotal,
                  order.buyer,
                  order.id,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#138256] px-4 text-sm font-bold text-white transition hover:bg-[#0f6c48]"
              >
                <WhatsAppIcon />
                Abrir WhatsApp
              </a>
            </div>
          </section>
        ))}
      </div>

      {!compact && (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-md bg-[#e7492f] px-5 text-sm font-bold text-white transition hover:bg-[#c83e27]">
            Continuar a comprar
          </Link>
          <Link href="/cart" className="inline-flex h-12 items-center justify-center rounded-md border border-[#cfe2d5] bg-white px-5 text-sm font-bold text-[#0b3b2f] transition hover:bg-[#e7f5ee]">
            Ver carrinho
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    sellerGroups,
  } = useCart();
  const [buyer, setBuyer] = useState<BuyerDetails>({ name: "", phone: "" });
  const [savedOrder, setSavedOrder] = useState<StoredOrder | null>(null);
  const [recentOrder, setRecentOrder] = useState<StoredOrder | null>(null);

  useEffect(() => {
    const [latestOrder] = readStoredOrders();
    setRecentOrder(latestOrder || null);
  }, []);

  const canSaveOrder = useMemo(
    () =>
      Boolean(
        buyer.name.trim() && buyer.phone.trim() && items.length > 0,
      ),
    [buyer, items.length],
  );

  const saveOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSaveOrder) return;

    const order: StoredOrder = {
      id: `MSTP-${Date.now().toString().slice(-8)}`,
      buyer: {
        name: buyer.name.trim(),
        phone: buyer.phone.trim(),
      },
      sellers: sellerGroups.map((group) => ({
        sellerId: group.seller.id,
        mobileNumber: group.seller.mobile_number,
        whatsappLink: group.seller.whatsapp_link,
        district: group.seller.district,
        products: group.items.map((item) => {
          const unitPrice = Number(item.ad.price || 0);
          return {
            adId: item.ad.id,
            productName: item.ad.product_name,
            category: item.ad.category?.name || "Sem categoria",
            quantity: item.quantity,
            unitPrice,
            lineTotal: unitPrice * item.quantity,
            imageUrl: item.ad.images?.[0]?.image_url || null,
          };
        }),
        subtotal: group.subtotal,
      })),
      totalItems,
      totalPrice,
      createdAt: new Date().toISOString(),
      status: "SAVED",
    };

    const existingOrders = readStoredOrders();
    window.localStorage.setItem(
      "stpmarket_orders",
      JSON.stringify([order, ...existingOrders].slice(0, 30)),
    );
    setSavedOrder(order);
    setRecentOrder(order);
    clearCart();
  };

  if (savedOrder) {
    return <SavedOrderView order={savedOrder} />;
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#f4fbf6]">
        <section className="border-b border-[#d8e7dc] bg-white">
          <div className="mx-auto max-w-[1100px] px-4 py-9 sm:px-6 lg:px-10">
            <p className="market-kicker">Os seus pedidos</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-[#07382d] sm:text-5xl">Carrinho</h1>
          </div>
        </section>

        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <div className="grid overflow-hidden rounded-lg border border-[#d8e7dc] bg-white shadow-[0_16px_38px_rgba(14,42,35,0.08)] lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="p-7 sm:p-10">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e7f5ee] text-[#0b3b2f]">
                <EmptyCartIcon />
              </span>
              <h2 className="mt-5 font-serif text-3xl font-semibold text-[#07382d]">O seu carrinho está vazio</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#60776e]">
                Adicione produtos para organizar o pedido por anunciante e preparar as mensagens de WhatsApp.
              </p>
              <Link href="/" className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-[#e7492f] px-5 text-sm font-bold text-white transition hover:bg-[#c83e27]">
                Explorar produtos
              </Link>
            </section>
            <aside className="bg-[#0b2f27] p-7 text-white sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb199]">Como funciona</p>
              <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                {["Escolha os produtos", "Organize por anunciante", "Confirme pelo WhatsApp"].map((step, index) => (
                  <div key={step} className="flex items-center gap-3 py-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/10 text-xs font-black text-[#ffb199]">{index + 1}</span>
                    <span className="text-sm font-bold">{step}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          {recentOrder && (
            <div className="mt-7">
              <SavedOrderView order={recentOrder} compact />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4fbf6]">
      <section className="border-b border-[#d8e7dc] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-9 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-10">
          <div>
            <Link href="/" className="text-sm font-bold text-[#e7492f] hover:text-[#c83e27]">Continuar a comprar</Link>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-[#07382d] sm:text-5xl">Carrinho de pedidos</h1>
            <p className="mt-2 text-sm text-[#60776e]">
              {totalItems} produto{totalItems !== 1 ? "s" : ""} de {sellerGroups.length} anunciante{sellerGroups.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button type="button" onClick={clearCart} className="self-start text-sm font-bold text-[#b53828] transition hover:text-[#8f2b20] md:self-auto">
            Limpar carrinho
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6 lg:px-10 lg:py-12">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-5">
          {sellerGroups.map((group, groupIndex) => (
            <section key={group.sellerKey} className="overflow-hidden rounded-lg border border-[#d8e7dc] bg-white shadow-[0_14px_34px_rgba(14,42,35,0.08)]">
              <div className="flex flex-col justify-between gap-4 border-b border-[#d8e7dc] bg-[#eef8f1] px-5 py-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#e7492f]">Anunciante {groupIndex + 1}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-lg font-black text-[#0b2f27]">{group.seller.mobile_number}</h2>
                    <span className="text-sm text-[#60776e]">{DistrictLabels[group.seller.district]}</span>
                  </div>
                </div>
                <a
                  href={getWhatsAppUrl(group.seller, groupProductsForMessage(group), group.subtotal, buyer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#138256] px-4 text-sm font-bold text-white transition hover:bg-[#0f6c48]"
                >
                  <WhatsAppIcon />
                  Contactar no WhatsApp
                </a>
              </div>

              <div className="divide-y divide-[#edf4ef] px-5">
                {group.items.map((item) => {
                  const unitPrice = Number(item.ad.price || 0);
                  const imageUrl = item.ad.images?.[0]?.image_url;
                  return (
                    <div key={item.ad.id} className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md border border-[#d8e7dc] bg-[#eef8f1] font-serif text-2xl font-semibold text-[#0b3b2f]">
                          {imageUrl ? (
                            <Image src={imageUrl} alt="" fill className="object-contain" sizes="80px" />
                          ) : (
                            item.ad.product_name.charAt(0).toUpperCase()
                          )}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/ads/${item.ad.id}`} className="line-clamp-2 font-bold text-[#0b2f27] transition hover:text-[#e7492f]">{item.ad.product_name}</Link>
                          <p className="mt-1 text-sm text-[#60776e]">{item.ad.category?.name || "Sem categoria"}</p>
                          <p className="mt-2 text-sm font-black text-[#0b3b2f]">{formatCurrency(unitPrice * item.quantity)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="flex h-10 items-center rounded-md border border-[#cfe2d5] bg-white">
                          <button type="button" onClick={() => updateQuantity(item.ad.id, Math.max(1, item.quantity - 1))} className="grid h-10 w-10 place-items-center text-[#0b3b2f] transition hover:bg-[#e7f5ee]" aria-label={`Diminuir quantidade de ${item.ad.product_name}`} title="Diminuir quantidade">
                            <MinusIcon />
                          </button>
                          <span className="grid h-10 min-w-10 place-items-center border-x border-[#cfe2d5] px-2 text-sm font-black text-[#0b2f27]">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.ad.id, item.quantity + 1)} className="grid h-10 w-10 place-items-center text-[#0b3b2f] transition hover:bg-[#e7f5ee]" aria-label={`Aumentar quantidade de ${item.ad.product_name}`} title="Aumentar quantidade">
                            <PlusIcon />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.ad.id)} className="grid h-10 w-10 place-items-center rounded-md text-[#b53828] transition hover:bg-[#ffe8df]" aria-label={`Remover ${item.ad.product_name} do carrinho`} title="Remover produto">
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-[#d8e7dc] bg-[#fbfefc] px-5 py-4">
                <span className="text-sm font-bold text-[#60776e]">Subtotal deste anunciante</span>
                <span className="text-lg font-black text-[#0b3b2f]">{formatCurrency(group.subtotal)}</span>
              </div>
            </section>
          ))}
        </div>

        <aside className="rounded-lg border border-[#d8e7dc] bg-white p-5 shadow-[0_14px_34px_rgba(14,42,35,0.08)] sm:p-6 lg:sticky lg:top-36">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7492f]">Guardar pedido</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-[#07382d]">Os seus dados</h2>
          <p className="mt-2 text-sm leading-6 text-[#60776e]">Estes dados entram na mensagem pronta para cada anunciante.</p>

          <form onSubmit={saveOrder} className="mt-5 space-y-4">
            <div>
              <label htmlFor="buyer-name" className="market-label mb-2">Nome</label>
              <input id="buyer-name" value={buyer.name} onChange={(event) => setBuyer((current) => ({ ...current, name: event.target.value }))} className="market-field" placeholder="O seu nome" required />
            </div>
            <div>
              <label htmlFor="buyer-phone" className="market-label mb-2">Telefone ou WhatsApp</label>
              <input id="buyer-phone" type="tel" value={buyer.phone} onChange={(event) => setBuyer((current) => ({ ...current, phone: event.target.value }))} className="market-field" placeholder="+239 ..." required />
            </div>
            <div className="border-y border-[#edf4ef] py-4">
              <div className="flex justify-between gap-4 text-sm text-[#60776e]"><span>Produtos</span><span className="font-bold text-[#0b2f27]">{totalItems}</span></div>
              <div className="mt-2 flex justify-between gap-4 text-sm text-[#60776e]"><span>Anunciantes</span><span className="font-bold text-[#0b2f27]">{sellerGroups.length}</span></div>
              <div className="mt-4 flex items-end justify-between gap-4"><span className="text-sm font-bold text-[#0b2f27]">Total</span><span className="text-2xl font-black text-[#0b3b2f]">{formatCurrency(totalPrice)}</span></div>
            </div>

            <button type="submit" disabled={!canSaveOrder} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-[#e7492f] px-5 text-sm font-bold text-white transition hover:bg-[#c83e27] disabled:cursor-not-allowed disabled:bg-[#c7d3cd]">
              Guardar pedido e ver contactos
            </button>
            <p className="text-xs leading-5 text-[#60776e]">Guardar não envia a encomenda automaticamente. Confirme o pedido pelo WhatsApp com cada anunciante.</p>
          </form>
        </aside>
        </div>
      </div>
    </div>
  );
}
