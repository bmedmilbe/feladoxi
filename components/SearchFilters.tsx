// components/SearchFilters.tsx
"use client";

import {
  DistrictLabels,
  FilterState,
  Category,
  ConditionLabels,
} from "@/types";

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: Category[];
}

export function SearchFilters({
  filters,
  onFilterChange,
  categories,
}: SearchFiltersProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "",
      district: "",
      condition: "",
    });
  };

  const hasActiveFilters =
    filters.search || filters.category || filters.district || filters.condition;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Pesquisar Produtos
          </label>
          <input
            id="search"
            type="text"
            placeholder="Pesquisar por nome..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Category Selector */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Categoria
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.icon || "📁"} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Selector */}
        <div>
          <label
            htmlFor="district"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Distrito
          </label>
          <select
            id="district"
            value={filters.district}
            onChange={(e) => handleChange("district", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todos os Distritos</option>
            {Object.entries(DistrictLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <label
            htmlFor="condition"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Condição
          </label>
          <select
            id="condition"
            value={filters.condition || ""}
            onChange={(e) => handleChange("condition", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todas as Condições</option>
            {Object.entries(ConditionLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-500 mr-2">Filtros rápidos:</span>
        <button
          onClick={() => handleChange("condition", "NEW")}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.condition === "NEW"
              ? "bg-blue-500 text-white border-blue-500"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          🆕 Novo
        </button>
        <button
          onClick={() => handleChange("condition", "LOCAL")}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filters.condition === "LOCAL"
              ? "bg-blue-500 text-white border-blue-500"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          🇸🇹 Local
        </button>
        <button
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.set("featured", "true");
            window.location.search = params.toString();
          }}
          className="px-3 py-1 text-sm rounded-full border border-yellow-400 hover:bg-yellow-50 transition-colors"
        >
          ⭐ Destaque
        </button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
}
