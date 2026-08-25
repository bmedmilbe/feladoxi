"use client";

import { useState } from "react";

import {
  DistrictLabels,
  FilterState,
  Category,
  ConditionLabels,
} from "@/types";
import {
  SearchAutocomplete,
  type SearchSuggestion,
} from "@/components/SearchAutocomplete";
import { useLanguage } from "@/context/LanguageContext";

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: Category[];
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M7 12h10m-7 6h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchFilters({
  filters,
  onFilterChange,
  categories,
}: SearchFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { language, tr, categoryName } = useLanguage();
  const englishConditionLabels: Record<string, string> = {
    NEW: "New",
    USED: "Used",
    IMPORTED: "Imported",
    LOCAL: "Made in São Tomé",
  };

  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "",
      district: "",
      condition: "",
      featured: "",
    });
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.district) {
      onFilterChange({
        ...filters,
        search: "",
        district: suggestion.district,
      });
      return;
    }

    if (suggestion.condition) {
      onFilterChange({
        ...filters,
        search: "",
        condition: suggestion.condition,
      });
      return;
    }

    if (suggestion.categorySlug) {
      onFilterChange({
        ...filters,
        search: "",
        category: suggestion.categorySlug,
      });
      return;
    }

    handleChange("search", suggestion.label);
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.district ||
    filters.condition ||
    filters.featured;

  const controlClass =
    "h-12 w-full rounded-md border border-[#c8dde5] bg-white px-4 text-sm font-medium text-[#183e58] outline-none transition focus:border-[#08a6a6] focus:ring-4 focus:ring-[#08a6a6]/10";

  return (
    <div className="rounded-lg border border-[#dceaf0] bg-white p-2 shadow-[0_10px_24px_rgba(7,52,79,0.05)] md:p-4 md:shadow-[0_14px_34px_rgba(7,52,79,0.07)]">
      <button
        type="button"
        onClick={() => setMobileFiltersOpen((open) => !open)}
        className="flex h-11 w-full items-center justify-between rounded-md px-3 text-sm font-black text-[#082f4f] md:hidden"
        aria-expanded={mobileFiltersOpen}
        aria-controls="product-filter-controls"
      >
        <span className="inline-flex items-center gap-2"><FilterIcon /> {tr("Filtrar produtos", "Filter products")}</span>
        <span className="inline-flex items-center gap-2">
          {hasActiveFilters && <span className="rounded-full bg-[#08a6a6] px-2 py-0.5 text-[10px] text-white">{tr("Ativos", "Active")}</span>}
          <ChevronIcon open={mobileFiltersOpen} />
        </span>
      </button>

      <div id="product-filter-controls" className={`${mobileFiltersOpen ? "grid" : "hidden"} mt-3 grid-cols-1 gap-4 md:mt-0 md:grid md:grid-cols-2 xl:grid-cols-4`}>
        <div>
          <label htmlFor="filter-search" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#657d8d]">
            {tr("Pesquisa", "Search")}
          </label>
          <div className="relative">
            <SearchAutocomplete
              id="filter-search"
              placeholder={tr("Nome, condição ou distrito...", "Name, condition or district...")}
              value={filters.search}
              onChange={(value) => handleChange("search", value)}
              onSuggestionSelect={selectSuggestion}
              inputClassName={`${controlClass} pl-11 pr-10`}
              iconClassName="left-4"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => handleChange("search", "")}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#657d8d] transition hover:bg-[#e4f7f7] hover:text-[#078b8d]"
                aria-label="Limpar pesquisa"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#657d8d]">
            {tr("Categoria", "Category")}
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(event) => handleChange("category", event.target.value)}
            className={controlClass}
          >
            <option value="">{tr("Todas as categorias", "All categories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {categoryName(category.slug, category.name)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="district" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#657d8d]">
            {tr("Distrito", "District")}
          </label>
          <select
            id="district"
            value={filters.district}
            onChange={(event) => handleChange("district", event.target.value)}
            className={controlClass}
          >
            <option value="">{tr("Todos os distritos", "All districts")}</option>
            {Object.entries(DistrictLabels).filter(([key]) => key !== "UNKNOWN").map(([key, label]) => (
              <option key={key} value={key}>
                {language === "en" && key === "DIASPORA" ? "Diaspora" : label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#657d8d]">
            {tr("Condição", "Condition")}
          </label>
          <select
            id="condition"
            value={filters.condition || ""}
            onChange={(event) => handleChange("condition", event.target.value)}
            className={controlClass}
          >
            <option value="">{tr("Todas as condições", "All conditions")}</option>
            {Object.entries(ConditionLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {language === "en" ? englishConditionLabels[key] || label : label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`${mobileFiltersOpen ? "flex" : "hidden"} mt-4 flex-wrap items-center gap-2 md:flex`}>
        <span className="mr-1 text-xs font-black uppercase tracking-[0.14em] text-[#657d8d]">
          {tr("Filtros rápidos", "Quick filters")}
        </span>
        <button
          type="button"
          onClick={() => handleChange("condition", filters.condition === "NEW" ? "" : "NEW")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            filters.condition === "NEW"
              ? "border-[#08a6a6] bg-[#08a6a6] text-white"
              : "border-[#c8dde5] bg-white text-[#183e58] hover:border-[#08a6a6]"
          }`}
        >
          {tr("Novo", "New")}
        </button>
        <button
          type="button"
          onClick={() => handleChange("condition", filters.condition === "LOCAL" ? "" : "LOCAL")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            filters.condition === "LOCAL"
              ? "border-[#08a6a6] bg-[#08a6a6] text-white"
              : "border-[#c8dde5] bg-white text-[#183e58] hover:border-[#08a6a6]"
          }`}
        >
          {tr("Local", "Local")}
        </button>
        <button
          type="button"
          onClick={() => handleChange("featured", filters.featured === "true" ? "" : "true")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            filters.featured === "true"
              ? "border-[#082f4f] bg-[#082f4f] text-white"
              : "border-[#c8dde5] bg-white text-[#183e58] hover:border-[#08a6a6]"
          }`}
        >
          {tr("Destaques", "Featured")}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto rounded-full px-4 py-2 text-sm font-bold text-[#078b8d] transition hover:bg-[#e4f7f7]"
          >
            {tr("Limpar filtros", "Clear filters")}
          </button>
        )}
      </div>
    </div>
  );
}
