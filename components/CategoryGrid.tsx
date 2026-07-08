// components/CategoryGrid.tsx
"use client";

import { useRouter } from "next/navigation";
import { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const router = useRouter();

  // Group categories by their main categories
  const mainCategories = [
    {
      name: "Veículos",
      icon: "🚗",
      slugs: [
        "carros",
        "motorizadas",
        "bicicletas",
        "barcos",
        "pecas-e-acessorios",
      ],
    },
    {
      name: "Imóveis",
      icon: "🏡",
      slugs: ["casas", "apartamentos", "terrenos", "espacos-comerciais"],
    },
    {
      name: "Eletrónicos",
      icon: "📱",
      slugs: [
        "telemoveis",
        "computadores",
        "tablets",
        "televisoes",
        "consolas",
        "acessorios",
      ],
    },
    {
      name: "Casa",
      icon: "🛋️",
      slugs: [
        "moveis",
        "frigorificos",
        "fogoes",
        "maquinas-de-lavar",
        "decoracao",
      ],
    },
    {
      name: "Moda",
      icon: "👕",
      slugs: ["roupa", "calcado", "malas", "relogios", "joias"],
    },
    {
      name: "Animais",
      icon: "🐄",
      slugs: [
        "caes",
        "gatos",
        "galinhas",
        "cabras",
        "porcos",
        "gado",
        "acessorios",
      ],
    },
    {
      name: "Agricultura",
      icon: "🌾",
      slugs: [
        "ferramentas",
        "maquinas",
        "produtos-agricolas",
        "equipamentos-de-pesca",
      ],
    },
    { name: "Outros", icon: "🎁", slugs: ["outros"] },
  ];

  const handleCategoryClick = (slug: string) => {
    router.push(`/?category=${slug}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {mainCategories.map((category, index) => (
        <button
          key={index}
          onClick={() => handleCategoryClick(category.slugs[0])}
          className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
            {category.icon}
          </span>
          <span className="text-sm font-medium text-gray-700 text-center">
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
}
