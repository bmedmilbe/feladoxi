"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Category } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

interface CategoryGridProps {
  categories: Category[];
}

interface CategoryCardProps {
  category: Category;
  index: number;
  onSelect: (category: Category) => void;
}

function ArrowIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getCategoryImage(slug: string, index: number) {
  const normalized = slug.toLowerCase();

  if (/elect|comput|telefon|acessor|consol/.test(normalized)) {
    return "/images/category-electronics.png";
  }
  if (/moda|roup|calcado/.test(normalized)) {
    return "/images/category-fashion.png";
  }
  if (/cacau|cafe|agric|local|aliment/.test(normalized)) {
    return "/images/category-local-products.png";
  }

  return [
    "/images/mercado-hero.png",
    "/images/category-local-products.png",
    "/images/category-electronics.png",
    "/images/category-fashion.png",
  ][index % 4];
}

function categoryPriority(category: Category) {
  const slug = category.slug.toLowerCase();
  if (/cacau|cafe|agric|local|aliment/.test(slug)) return 0;
  if (/elect|comput|telefon/.test(slug)) return 1;
  if (/moda|roup|calcado/.test(slug)) return 2;
  if (/casa|mov|decor/.test(slug)) return 3;
  return 10;
}

function CategoryCard({ category, index, onSelect }: CategoryCardProps) {
  const { tr, categoryName } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#dceaf0] bg-white text-left shadow-[0_10px_24px_rgba(7,52,79,0.05)] transition hover:border-[#08a6a6] hover:shadow-[0_16px_30px_rgba(7,52,79,0.10)] md:grid md:min-h-[154px] md:grid-cols-[42%_1fr]"
    >
      <span className="relative h-20 overflow-hidden bg-[#e9f3f4] md:h-auto md:min-h-[154px]">
        <Image
          src={getCategoryImage(category.slug, index)}
          alt=""
          fill
          sizes="(max-width: 640px) 42vw, (max-width: 1280px) 21vw, 11vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center px-2 py-3 md:px-4 md:py-4">
        <strong className="line-clamp-2 text-center text-xs font-black leading-4 text-[#082f4f] md:text-left md:text-sm md:leading-5">
          {categoryName(category.slug, category.name)}
        </strong>
        <span className="mt-2 hidden line-clamp-2 text-xs leading-5 text-[#657d8d] md:block">
          {category.description || tr("Explore os anúncios desta categoria.", "Explore listings in this category.")}
        </span>
        <span className="mt-3 hidden h-9 w-9 items-center justify-center self-end rounded-full bg-[#dff5f5] text-[#078b8d] transition group-hover:bg-[#09a5a6] group-hover:text-white md:inline-flex">
          <ArrowIcon />
        </span>
      </span>
    </button>
  );
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const { tr } = useLanguage();
  const router = useRouter();
  const [rotationIndex, setRotationIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const displayCategories = useMemo(
    () =>
      [...categories].sort(
        (first, second) => categoryPriority(first) - categoryPriority(second),
      ),
    [categories],
  );

  useEffect(() => {
    if (showAll || displayCategories.length <= 3) return;

    const interval = window.setInterval(() => {
      setRotationIndex((current) => current + 1);
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [displayCategories.length, showAll]);

  const previewCategories = Array.from(
    { length: Math.min(3, displayCategories.length) },
    (_, offset) =>
      displayCategories[(rotationIndex * 3 + offset) % displayCategories.length],
  );
  const previewCategoryIds = new Set(
    previewCategories.map((category) => category.id),
  );
  const remainingCategories = displayCategories.filter(
    (category) => !previewCategoryIds.has(category.id),
  );
  const visibleCategories = showAll
    ? [...previewCategories, ...remainingCategories]
    : previewCategories;

  const selectCategory = (category: Category) => {
    router.push(`/?category=${encodeURIComponent(category.slug)}#produtos`);
  };

  if (displayCategories.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-2 md:gap-4" aria-label={tr("A carregar categorias", "Loading categories")}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[122px] animate-pulse rounded-lg border border-[#dceaf0] bg-[#eef6f8] md:h-[154px]" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {displayCategories.length > 3 && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowAll((visible) => !visible)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#08a6a6] bg-white px-4 text-xs font-black text-[#078b8d] transition hover:bg-[#e4f7f7] md:h-12 md:gap-3 md:px-5 md:text-sm"
            aria-expanded={showAll}
            aria-controls="featured-category-grid"
          >
            <GridIcon />
            {showAll ? tr("Mostrar menos", "Show less") : tr("Mostrar mais", "Show more")}
            <ChevronIcon open={showAll} />
          </button>
        </div>
      )}

      <div id="featured-category-grid" className="grid grid-cols-3 gap-2 md:gap-4">
        {visibleCategories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            onSelect={selectCategory}
          />
        ))}
      </div>
    </div>
  );
}
