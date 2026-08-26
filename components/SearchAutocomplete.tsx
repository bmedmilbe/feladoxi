"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAds, fetchCategories } from "@/lib/api";
import { DistrictLabels, type Ad, type AdCondition, type ApiResponse, type Category, type District } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export interface SearchSuggestion {
  id: string;
  label: string;
  detail: string;
  type: "product" | "category" | "condition" | "district";
  categorySlug?: string;
  condition?: AdCondition;
  district?: District;
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

function ConditionIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5h14v14H5V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DistrictIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 9.5c0 5.2-7 11.5-7 11.5S5 14.7 5 9.5a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const conditionSearchTerms: Record<AdCondition, string[]> = {
  NEW: ["novo", "nova", "novos", "novas", "new"],
  USED: ["usado", "usada", "usados", "usadas", "used"],
  IMPORTED: ["importado", "importada", "importados", "importadas", "imported"],
  LOCAL: ["local", "produzido em sao tome", "produzida em sao tome", "made in sao tome"],
};

const districtSearchTerms: Record<Exclude<District, "UNKNOWN">, string[]> = {
  AGUA_GRANDE: ["agua grande"],
  MEZOCHI: ["mezochi", "me zochi", "me-zochi"],
  LEMBA: ["lemba"],
  CAUE: ["caue"],
  LOBATA: ["lobata"],
  CANTAGALO: ["cantagalo"],
  RAP: ["rap", "principe", "regiao autonoma de principe"],
  DIASPORA: ["diaspora"],
};

export function conditionFromSearch(value: string): AdCondition | null {
  const normalizedValue = normalizeSearchText(value.trim());
  const match = (Object.entries(conditionSearchTerms) as Array<[AdCondition, string[]]>)
    .find(([, terms]) => terms.includes(normalizedValue));
  return match?.[0] || null;
}

export function districtFromSearch(value: string): District | null {
  const normalizedValue = normalizeSearchText(value.trim());
  const match = (Object.entries(districtSearchTerms) as Array<[Exclude<District, "UNKNOWN">, string[]]>)
    .find(([, terms]) => terms.includes(normalizedValue));
  return match?.[0] || null;
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
  const { language, tr, categoryName } = useLanguage();
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

    const conditionLabels: Record<AdCondition, string> = {
      NEW: tr("Novo", "New"),
      USED: tr("Usado", "Used"),
      IMPORTED: tr("Importado", "Imported"),
      LOCAL: tr("Produzido em São Tomé", "Made in São Tomé"),
    };
    const conditions = (Object.entries(conditionSearchTerms) as Array<[AdCondition, string[]]>)
      .filter(([condition, terms]) =>
        normalizeSearchText(`${conditionLabels[condition]} ${terms.join(" ")}`).includes(normalizedSearch),
      )
      .slice(0, 2)
      .map(([condition]) => ({
        id: `condition-${condition}`,
        label: conditionLabels[condition],
        detail: tr("Condição do produto", "Product condition"),
        type: "condition" as const,
        condition,
      }));

    const districts = (Object.entries(districtSearchTerms) as Array<[Exclude<District, "UNKNOWN">, string[]]>)
      .filter(([district, terms]) =>
        normalizeSearchText(`${DistrictLabels[district]} ${terms.join(" ")}`).includes(normalizedSearch),
      )
      .slice(0, 2)
      .map(([district]) => ({
        id: `district-${district}`,
        label: language === "en" && district === "DIASPORA" ? "Diaspora" : DistrictLabels[district],
        detail: tr("Distrito", "District"),
        type: "district" as const,
        district,
      }));

    const categories = (categoryData?.results || [])
      .filter((category) =>
        normalizeSearchText(`${category.name} ${categoryName(category.slug, category.name)} ${category.description || ""}`).includes(
          normalizedSearch,
        ),
      )
      .slice(0, 3)
      .map((category) => ({
        id: `category-${category.id}`,
        label: categoryName(category.slug, category.name),
        detail: tr("Categoria", "Category"),
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
      .slice(0, Math.max(2, 6 - categories.length - conditions.length - districts.length))
      .map((ad) => ({
        id: `product-${ad.id}`,
        label: ad.product_name,
        detail: ad.category ? categoryName(ad.category.slug, ad.category.name) : tr("Produto", "Product"),
        type: "product" as const,
      }));

    return [...conditions, ...districts, ...products, ...categories].slice(0, 6);
  }, [categoryData?.results, categoryName, language, normalizedSearch, productData?.results, tr]);

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
                {suggestion.type === "product"
                  ? <ProductIcon />
                  : suggestion.type === "condition"
                    ? <ConditionIcon />
                    : suggestion.type === "district"
                      ? <DistrictIcon />
                      : <CategoryIcon />}
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
                {suggestion.type === "product"
                  ? tr("Produto", "Product")
                  : suggestion.type === "condition"
                    ? tr("Filtrar", "Filter")
                    : suggestion.type === "district"
                      ? tr("Local", "Location")
                      : tr("Ver", "View")}
              </span>
            </button>
          ))}

          {isFetching && suggestions.length === 0 && (
            <div className="px-4 py-5 text-sm font-medium text-[#60776e]">
              {tr("A procurar sugestões...", "Searching for suggestions...")}
            </div>
          )}

          {!isFetching && normalizedSearch.length >= 2 && suggestions.length === 0 && (
            <div className="px-4 py-5 text-sm font-medium text-[#60776e]">
              {tr("Sem sugestões. Prima Enter para pesquisar.", "No suggestions. Press Enter to search.")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
