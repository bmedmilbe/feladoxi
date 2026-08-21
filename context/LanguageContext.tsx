"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "pt" | "en";

const englishCategoryNames: Record<string, string> = {
  acessorios: "Accessories",
  apartamentos: "Apartments",
  "artigos-para-bebe": "Baby products",
  barcos: "Boats",
  bicicletas: "Bicycles",
  brinquedos: "Toys",
  cabras: "Goats",
  cacau: "Cocoa",
  caes: "Dogs",
  cafe: "Coffee",
  calcado: "Footwear",
  carrinhos: "Pushchairs",
  carros: "Cars",
  casas: "Houses",
  computadores: "Computers",
  consolas: "Consoles",
  decoracao: "Decoration",
  "equipamento-desportivo": "Sports equipment",
  equipamentos: "Equipment",
  "equipamentos-de-escritorio": "Office equipment",
  "equipamentos-de-pesca": "Fishing equipment",
  "equipamentos-de-restauracao": "Restaurant equipment",
  "espacos-comerciais": "Commercial spaces",
  ferramentas: "Tools",
  "ferramentas-profissionais": "Professional tools",
  fogoes: "Cookers",
  frigorificos: "Refrigerators",
  frutas: "Fruit",
  gado: "Cattle",
  galinhas: "Chickens",
  gatos: "Cats",
  "instrumentos-musicais": "Musical instruments",
  jogos: "Games",
  joias: "Jewellery",
  legumes: "Vegetables",
  livros: "Books",
  malas: "Bags",
  maquinas: "Machines",
  "maquinas-de-lavar": "Washing machines",
  marisco: "Seafood",
  "materiais-de-construcao": "Building materials",
  "material-escolar": "School supplies",
  mel: "Honey",
  motorizadas: "Motorcycles",
  moveis: "Furniture",
  outros: "Other",
  "pecas-e-acessorios": "Parts and accessories",
  peixe: "Fish",
  pimenta: "Pepper",
  porcos: "Pigs",
  "produtos-agricolas": "Agricultural products",
  relogios: "Watches",
  roupa: "Clothing",
  tablets: "Tablets",
  telemoveis: "Mobile phones",
  televisoes: "Televisions",
  terrenos: "Land",
  tintas: "Paint",
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  tr: (portuguese: string, english: string) => string;
  categoryName: (slug: string, originalName: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    const queryLanguage = new URLSearchParams(window.location.search).get("language");
    const storedLanguage = window.localStorage.getItem("market_language");
    const preferredLanguage = queryLanguage === "en" || queryLanguage === "pt"
      ? queryLanguage
      : storedLanguage;
    if (preferredLanguage === "en" || preferredLanguage === "pt") {
      setLanguageState(preferredLanguage);
      window.localStorage.setItem("market_language", preferredLanguage);
      document.documentElement.lang = preferredLanguage === "en" ? "en" : "pt-ST";
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("market_language", nextLanguage);
    document.documentElement.lang = nextLanguage === "en" ? "en" : "pt-ST";
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      tr: (portuguese, english) => (language === "en" ? english : portuguese),
      categoryName: (slug, originalName) =>
        language === "en" ? englishCategoryNames[slug] || originalName : originalName,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LocalizedText({ pt, en }: { pt: string; en: string }) {
  const { tr } = useLanguage();
  return <>{tr(pt, en)}</>;
}
