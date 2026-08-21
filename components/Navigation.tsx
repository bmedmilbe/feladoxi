"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchCategories } from "@/lib/api";
import type { ApiResponse, Category } from "@/types";
import {
  SearchAutocomplete,
  type SearchSuggestion,
} from "@/components/SearchAutocomplete";

function SearchIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m21 21-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 7.8c1 4.2 3.5 6.7 7.7 7.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CategoryIcon({ slug, index }: { slug: string; index: number }) {
  const normalized = slug.toLowerCase();

  if (/elect|comput|telefon|acessor/.test(normalized)) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (/moda|roup|calcado/.test(normalized)) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m8 4 4 3 4-3 4 4-3 3v9H7v-9L4 8l4-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (/casa|mov|decor|imov/.test(normalized)) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14v7H5v-7ZM7 12V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M7 19v2m10-2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (/car|veicul|mota/.test(normalized)) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m5 16 1.5-6h11l1.5 6M4 16h16v3H4v-3ZM7 19v2m10-2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (index % 2 === 0) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M19 4C10 4 5 9 5 18c9 0 14-5 14-14ZM5 18c2-4 5-7 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 8a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ProductIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14v13H5V7Zm3 0a4 4 0 0 1 8 0M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="flex shrink-0 items-center gap-2.5">
      <svg className="h-12 w-14" viewBox="0 0 58 50" fill="none" aria-hidden="true">
        <circle cx="29" cy="9" r="7" fill="#ffd23f" />
        <path d="M8 31V14l21 20 21-20v17" stroke="#0aa7a6" strokeWidth="6" strokeLinejoin="miter" />
        <path d="M8 38c7-4 14-4 21 0 7-4 14-4 21 0M11 44c6-3 12-3 18 0 6-3 12-3 18 0" stroke="#0a4a71" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="hidden text-2xl font-black leading-none text-[#06365a] sm:block xl:text-3xl">
        Mercado STP
      </span>
    </span>
  );
}

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, hasPendingAd } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreCategoriesOpen, setMoreCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const isAccountPage = pathname.startsWith("/auth") || pathname.startsWith("/my-ads");
  const isCreatePage = pathname === "/ads/create";

  const { data: categoryData } = useQuery<ApiResponse<Category>>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
  const categoryLinks = categoryData?.results || [];
  const visibleCategoryLinks = categoryLinks.slice(0, 5);
  const remainingCategoryLinks = categoryLinks.slice(5);

  useEffect(() => {
    const syncCategory = () => {
      setActiveCategory(new URLSearchParams(window.location.search).get("category") || "");
    };

    syncCategory();
    window.addEventListener("popstate", syncCategory);
    return () => window.removeEventListener("popstate", syncCategory);
  }, [pathname]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    setActiveCategory("");
    router.push(query ? `/?search=${encodeURIComponent(query)}#produtos` : "/#produtos");
    setMobileMenuOpen(false);
    setMoreCategoriesOpen(false);
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.label);
    const target = suggestion.categorySlug
      ? `/?category=${encodeURIComponent(suggestion.categorySlug)}#produtos`
      : `/?search=${encodeURIComponent(suggestion.label)}#produtos`;
    setActiveCategory(suggestion.categorySlug || "");
    router.push(target);
    setMobileMenuOpen(false);
    setMoreCategoriesOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#dceaf0] bg-white text-[#082f4f] shadow-[0_8px_28px_rgba(7,52,79,0.06)]">
        <div className="hidden bg-[#effbfc] md:block">
          <div className="mx-auto flex h-10 max-w-[1536px] items-center justify-between px-6 text-xs font-semibold lg:px-8">
            <div className="flex items-center gap-7">
              <span className="inline-flex items-center gap-2"><LocationIcon /> Compra e venda em todo São Tomé e Príncipe</span>
              <span className="inline-flex items-center gap-2 border-l border-[#bad5df] pl-7"><WhatsAppIcon /> Contacto direto com o fornecedor</span>
            </div>
            <div className="flex items-center gap-5 text-[#37566c]">
              <Link href="/help" className="hover:text-[#079c9f]">Ajuda</Link>
              <Link href="/about" className="hover:text-[#079c9f]">Sobre nós</Link>
              <span>Português</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center gap-4 py-3 lg:gap-8">
            <Link href="/" className="shrink-0" aria-label="Mercado STP"><BrandMark /></Link>

            <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 sm:block">
              <label className="sr-only" htmlFor="nav-search">Pesquisar produtos</label>
              <div className="relative mx-auto max-w-[760px]">
                <SearchAutocomplete id="nav-search" value={searchQuery} onChange={setSearchQuery} onSuggestionSelect={selectSuggestion} placeholder="Pesquisar produtos, marcas e categorias..." inputClassName="h-14 w-full rounded-full border border-[#174f70] bg-white pl-14 pr-20 text-sm text-[#082f4f] outline-none transition placeholder:text-[#758796] focus:border-[#08a6a6] focus:ring-4 focus:ring-[#08a6a6]/10" iconClassName="left-6" />
                <button type="submit" className="absolute right-1.5 top-1.5 z-20 grid h-11 w-14 place-items-center rounded-full bg-[#09a5a6] text-white transition hover:bg-[#078b8d]" aria-label="Pesquisar"><SearchIcon /></button>
              </div>
            </form>

            <div className="ml-auto hidden items-center gap-1 lg:flex">
              <Link href={isAuthenticated ? "/my-ads" : "/auth/login"} className={`inline-flex h-12 items-center gap-2 px-3 text-sm font-semibold transition hover:text-[#079c9f] ${isAccountPage ? "text-[#079c9f]" : ""}`} aria-current={isAccountPage ? "page" : undefined}><UserIcon /><span>Minha conta</span></Link>
              <Link href="/?featured=true#produtos" className="inline-flex h-12 items-center gap-2 px-3 text-sm font-semibold transition hover:text-[#079c9f]"><HeartIcon /><span>Favoritos</span></Link>
              <Link href="/ads/create" className={`ml-2 inline-flex h-11 items-center rounded-md bg-[#ffd23f] px-5 text-sm font-black text-[#082f4f] transition hover:bg-[#f4c428] ${isCreatePage ? "ring-2 ring-[#079c9f] ring-offset-2" : ""}`}>Vender</Link>
            </div>

            <button type="button" onClick={() => { setMobileMenuOpen((open) => !open); setMoreCategoriesOpen(false); }} className="ml-auto grid h-11 w-11 place-items-center rounded-md border border-[#c8dde5] text-[#082f4f] lg:hidden" aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileMenuOpen}><MenuIcon open={mobileMenuOpen} /></button>
          </div>

          <form onSubmit={submitSearch} className="pb-3 sm:hidden">
            <label className="sr-only" htmlFor="mobile-search">Pesquisar produtos</label>
            <div className="relative">
              <SearchAutocomplete id="mobile-search" value={searchQuery} onChange={setSearchQuery} onSuggestionSelect={selectSuggestion} placeholder="Pesquisar produtos e categorias..." inputClassName="h-12 w-full rounded-full border border-[#174f70] bg-white pl-12 pr-16 text-sm outline-none focus:border-[#08a6a6] focus:ring-4 focus:ring-[#08a6a6]/10" iconClassName="left-4" />
              <button type="submit" className="absolute right-1 top-1 z-20 grid h-10 w-12 place-items-center rounded-full bg-[#09a5a6] text-white" aria-label="Pesquisar"><SearchIcon className="h-5 w-5" /></button>
            </div>
          </form>

          <div className="hidden items-center border-t border-[#e5eff3] sm:flex">
            <nav className="flex h-[58px] min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Categorias do mercado">
              <Link href="/#categorias" onClick={() => { setActiveCategory(""); setMoreCategoriesOpen(false); }} className={`mr-3 inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-bold transition ${!activeCategory ? "bg-[#09a5a6] text-white" : "bg-[#eefafa] text-[#087f82] hover:bg-[#dff5f5]"}`}><GridIcon /> Todas as categorias</Link>
              {visibleCategoryLinks.map((category, index) => {
                const isActive = activeCategory === category.slug;
                return (
                  <Link key={category.id} href={`/?category=${encodeURIComponent(category.slug)}#produtos`} onClick={() => { setActiveCategory(category.slug); setMoreCategoriesOpen(false); }} className={`inline-flex h-11 shrink-0 items-center gap-2 px-3 text-sm font-semibold transition ${isActive ? "text-[#079c9f]" : "text-[#183e58] hover:text-[#079c9f]"}`} aria-current={isActive ? "page" : undefined}>
                    <CategoryIcon slug={category.slug} index={index} /><span>{category.name}</span>
                  </Link>
                );
              })}
            </nav>
            {remainingCategoryLinks.length > 0 && (
              <button type="button" onClick={() => { setMoreCategoriesOpen((open) => !open); setMobileMenuOpen(false); }} className={`ml-2 inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-black transition sm:text-sm ${moreCategoriesOpen ? "bg-[#082f4f] text-white" : "bg-[#eefafa] text-[#087f82] hover:bg-[#dff5f5]"}`} aria-expanded={moreCategoriesOpen} aria-controls="more-categories-menu">
                <span className="hidden min-[430px]:inline">Mostrar mais</span>
                <span className="min-[430px]:hidden">Mais</span>
                <ChevronIcon open={moreCategoriesOpen} />
              </button>
            )}
          </div>

          {moreCategoriesOpen && remainingCategoryLinks.length > 0 && (
            <nav id="more-categories-menu" className="hidden max-h-[280px] grid-cols-2 gap-2 overflow-y-auto border-t border-[#dceaf0] py-4 sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Mais categorias">
              {remainingCategoryLinks.map((category, index) => {
                const categoryIndex = index + visibleCategoryLinks.length;
                const isActive = activeCategory === category.slug;
                return (
                  <Link key={category.id} href={`/?category=${encodeURIComponent(category.slug)}#produtos`} onClick={() => { setActiveCategory(category.slug); setMoreCategoriesOpen(false); }} className={`inline-flex min-h-11 min-w-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-[#082f4f] text-white" : "bg-[#f5fafb] text-[#183e58] hover:bg-[#e4f7f7] hover:text-[#078b8d]"}`}>
                    <span className="shrink-0"><CategoryIcon slug={category.slug} index={categoryIndex} /></span>
                    <span className="truncate">{category.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {mobileMenuOpen && (
            <div className="border-t border-[#dceaf0] pb-4 pt-3 lg:hidden">
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/ads/create" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-11 items-center justify-center rounded-md bg-[#ffd23f] px-4 text-sm font-black text-[#082f4f]">{hasPendingAd ? "Publicar rascunho" : "Começar a vender"}</Link>
                <Link href="/help" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-11 items-center justify-center rounded-md bg-[#effbfc] px-4 text-sm font-semibold">Ajuda</Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-11 items-center justify-center rounded-md bg-[#effbfc] px-4 text-sm font-semibold sm:col-span-2">Sobre nós</Link>
                {isAuthenticated && <button type="button" onClick={() => { logout(); setMobileMenuOpen(false); }} className="h-11 rounded-md px-4 text-left text-sm font-semibold text-[#b23b30] sm:col-span-2">Sair</button>}
              </div>
            </div>
          )}
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-[60] grid h-[72px] grid-cols-5 border-t border-[#c8dde5] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(7,52,79,0.12)] backdrop-blur lg:hidden" aria-label="Ações principais">
        <Link href="/#produtos" className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold text-[#183e58] sm:text-xs"><ProductIcon /><span className="max-w-full truncate">Produtos</span></Link>
        <Link href="/#categorias" className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold text-[#183e58] sm:text-xs"><GridIcon /><span className="max-w-full truncate">Categorias</span></Link>
        <Link href="/ads/create" className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-black sm:text-xs ${isCreatePage ? "text-[#078b8d]" : "text-[#082f4f]"}`} aria-current={isCreatePage ? "page" : undefined}><span className="grid h-8 w-8 place-items-center rounded-full bg-[#ffd23f]"><PlusIcon /></span><span className="max-w-full truncate">Anunciar</span></Link>
        <Link href="/?featured=true#produtos" className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold text-[#183e58] sm:text-xs"><HeartIcon className="h-5 w-5" /><span className="max-w-full truncate">Favoritos</span></Link>
        <Link href={isAuthenticated ? "/my-ads" : "/auth/login"} className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold sm:text-xs ${isAccountPage ? "text-[#079c9f]" : "text-[#183e58]"}`}><UserIcon className="h-5 w-5" /><span className="max-w-full truncate">Conta</span></Link>
      </nav>
    </>
  );
}
