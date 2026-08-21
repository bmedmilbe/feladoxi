"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const footerLinks = [
  {
    title: "Comprar",
    titleEn: "Buy",
    links: [
      { label: "Produtos locais", labelEn: "Local products", href: "/?category=produtos-agricolas" },
      { label: "Eletrónica", labelEn: "Electronics", href: "/?category=electronica" },
      { label: "Casa", labelEn: "Home", href: "/?category=moveis" },
      { label: "Veículos", labelEn: "Vehicles", href: "/?category=carros" },
    ],
  },
  {
    title: "Vender",
    titleEn: "Sell",
    links: [
      { label: "Anunciar produto", labelEn: "List a product", href: "/ads/create" },
      { label: "Os meus anúncios", labelEn: "My listings", href: "/my-ads" },
      { label: "Entrar", labelEn: "Sign in", href: "/auth/login" },
      { label: "Criar conta", labelEn: "Create account", href: "/auth/register" },
    ],
  },
  {
    title: "Mercado STP",
    titleEn: "Mercado STP",
    links: [
      { label: "Ajuda", labelEn: "Help", href: "/help" },
      { label: "Sobre nós", labelEn: "About us", href: "/about" },
      { label: "Publicidade", labelEn: "Advertising", href: "/advertise" },
      { label: "Destaques", labelEn: "Featured", href: "/?featured=true" },
      { label: "Categorias", labelEn: "Categories", href: "/#categorias" },
      { label: "Vitrine", labelEn: "Marketplace", href: "/#produtos" },
    ],
  },
];

function BrandMark() {
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-white/15 bg-white/10 text-[#65d8d5]">
      <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M24 37V11M24 11c-7 4-10 10-8 18 7-1 11-7 8-18Zm0 0c7 4 10 10 8 18-7-1-11-7-8-18Z"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 38c5-4 9-4 14 0 5-4 9-4 14 0M13 31c4-2 8-2 11 1 3-3 7-3 11-1"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Footer() {
  const { tr } = useLanguage();
  return (
    <footer id="rodape" className="border-t border-[#0d4d70] bg-[#052f4b] text-white">
      <div className="mx-auto px-4 py-8 sm:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3" aria-label="Mercado STP">
            <BrandMark />
            <span className="truncate text-xl font-black">Mercado STP</span>
          </Link>
          <span className="shrink-0 rounded-full border border-[#65d8d5]/35 bg-[#65d8d5]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#8ce4e1]">
            {tr("Mercado local", "Local marketplace")}
          </span>
        </div>

        <p className="mt-4 max-w-md text-sm leading-6 text-[#d9eef6]">
          {tr("Produtos de São Tomé e Príncipe, com contacto direto entre comprador e fornecedor.", "Products from São Tomé and Príncipe, with direct contact between buyers and sellers.")}
        </p>

        <Link
          href="/ads/create"
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-[#ffd23f] px-5 text-sm font-black text-[#082f4f] transition hover:bg-[#ffe071]"
        >
          {tr("Anunciar produto", "List a product")}
        </Link>

        <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {footerLinks.map((group) => (
            <details key={group.title} className="group">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-black [&::-webkit-details-marker]:hidden">
                <span>{tr(group.title, group.titleEn)}</span>
                <span className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-[#65d8d5]">
                  <ChevronIcon />
                </span>
              </summary>
              <nav className="grid grid-cols-2 gap-x-4 gap-y-3 pb-5 text-sm font-semibold text-[#d9eef6]">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="min-w-0 truncate transition hover:text-[#65d8d5]">
                    {tr(link.label, link.labelEn)}
                  </Link>
                ))}
              </nav>
            </details>
          ))}
        </div>
      </div>

      <div className="mx-auto hidden max-w-[1440px] gap-10 px-4 py-12 sm:grid sm:px-6 lg:grid-cols-[1.1fr_2fr] lg:px-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Mercado STP">
            <BrandMark />
            <span className="text-3xl font-black">Mercado STP</span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#d9eef6]">
            {tr("Compra e venda em São Tomé e Príncipe, com produtos locais, tecnologia, casa, moda e oportunidades para a comunidade.", "Buy and sell in São Tomé and Príncipe, with local products, technology, homeware, fashion and opportunities for the community.")}
          </p>
          <Link
            href="/ads/create"
            className="mt-6 inline-flex h-11 items-center rounded-md bg-[#ffd23f] px-5 text-sm font-black text-[#082f4f] transition hover:bg-[#ffe071]"
          >
            {tr("Anunciar produto", "List a product")}
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-[#ffe071]">
                {tr(group.title, group.titleEn)}
              </h2>
              <nav className="mt-4 grid gap-3 text-sm font-semibold text-[#d9eef6]">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition hover:text-[#65d8d5]"
                  >
                    {tr(link.label, link.labelEn)}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center px-4 py-4 text-center text-xs text-[#bdd7e0] sm:justify-between sm:px-6 sm:py-5 sm:text-left sm:text-sm lg:px-10">
          <span>Mercado STP</span>
          <span className="hidden sm:inline">{tr("Feito para comprar, vender e circular produtos com clareza.", "Made to help people buy, sell and discover products with clarity.")}</span>
        </div>
      </div>
    </footer>
  );
}
