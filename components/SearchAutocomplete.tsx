"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAds, fetchCategories } from "@/lib/api";
import type { Ad, ApiResponse, Category } from "@/types";

export interface SearchSuggestion {
  id: string;
  label: string;
  detail: string;
  type: "product" | "category";
  categorySlug?: string;
}

interface SearchAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  placeholder: string;
  inputClassName: string;
  iconClassName?: string;
  autoComplete?: string;
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m21 21-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 8a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function SearchAutocomplete({
  id,
  value,
  onChange,
  onSuggestionSelect,
  placeholder,
  inputClassName,
  iconClassName = "left-4",
  autoComplete = "off",
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [debouncedSearch, setDebouncedSearch] = useState(value.trim());
  const normalizedSearch = normalizeSearchText(debouncedSearch.trim());
  const listboxId = `${id}-suggestions`;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(value.trim());
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [value]);

  const { data: categoryData } = useQuery<ApiResponse<Category>>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  const { data: productData, isFetching } = useQuery<ApiResponse<Ad>>({
    queryKey: ["search-suggestions", debouncedSearch],
    queryFn: () =>
      fetchAds({
        search: debouncedSearch,
        category: "",
        district: "",
        condition: "",
        featured: "",
      }),
    enabled: normalizedSearch.length >= 2,
    staleTime: 60 * 1000,
  });

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    if (!normalizedSearch) return [];

    const categories = (categoryData?.results || [])
      .filter((category) =>
        normalizeSearchText(`${category.name} ${category.description || ""}`).includes(
          normalizedSearch,
        ),
      )
      .slice(0, 3)
      .map((category) => ({
        id: `category-${category.id}`,
        label: category.name,
        detail: "Categoria",
        type: "category" as const,
        categorySlug: category.slug,
      }));

    const seenProducts = new Set<string>();
    const products = (productData?.results || [])
      .filter((ad) => {
        const key = normalizeSearchText(ad.product_name);
        const searchableText = normalizeSearchText(
          `${ad.product_name} ${ad.description || ""} ${ad.category?.name || ""}`,
        );
        if (!searchableText.includes(normalizedSearch)) return false;
        if (seenProducts.has(key)) return false;
        seenProducts.add(key);
        return true;
      })
      .slice(0, Math.max(3, 6 - categories.length))
      .map((ad) => ({
        id: `product-${ad.id}`,
        label: ad.product_name,
        detail: ad.category?.name || "Produto",
        type: "product" as const,
      }));

    return [...products, ...categories].slice(0, 6);
  }, [categoryData?.results, normalizedSearch, productData?.results]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, suggestions.length]);

  const chooseSuggestion = (suggestion: SearchSuggestion) => {
    onChange(suggestion.label);
    onSuggestionSelect(suggestion);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current >= suggestions.length - 1 ? 0 : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      chooseSuggestion(suggestions[activeIndex]);
    }
  };

  const shouldShowPanel = isOpen && value.trim().length > 0;

  return (
    <div className="relative min-w-0 flex-1">
      <span className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[#527066] ${iconClassName}`}>
        <SearchIcon />
      </span>
      <input
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete={autoComplete}
        enterKeyHint="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shouldShowPanel}
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `${id}-suggestion-${activeIndex}` : undefined
        }
      />

      {shouldShowPanel && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-[70] overflow-hidden rounded-lg border border-[#cfe2d5] bg-white p-2 text-left shadow-[0_22px_60px_rgba(14,42,35,0.2)]"
          onMouseDown={(event) => event.preventDefault()}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              id={`${id}-suggestion-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseSuggestion(suggestion)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition ${
                activeIndex === index
                  ? "bg-[#e7f5ee] text-[#0b3b2f]"
                  : "text-[#173a32] hover:bg-[#f3faf6]"
              }`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#eef8f1] text-[#0b3b2f]">
                {suggestion.type === "product" ? <ProductIcon /> : <CategoryIcon />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">
                  {suggestion.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-[#60776e]">
                  {suggestion.detail}
                </span>
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#e7492f]">
                {suggestion.type === "product" ? "Produto" : "Ver"}
              </span>
            </button>
          ))}

          {isFetching && suggestions.length === 0 && (
            <div className="px-4 py-5 text-sm font-medium text-[#60776e]">
              A procurar sugestões...
            </div>
          )}

          {!isFetching && normalizedSearch.length >= 2 && suggestions.length === 0 && (
            <div className="px-4 py-5 text-sm font-medium text-[#60776e]">
              Sem sugestões. Prima Enter para pesquisar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
