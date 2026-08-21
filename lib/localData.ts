import type { Ad, ApiResponse, Category } from "@/types";
import localDb from "@/data/local-db.json";

function normalize<T>(items: T[]): ApiResponse<T> {
  return {
    count: items.length,
    next: null,
    previous: null,
    results: items,
  };
}

export function getLocalCategories(): ApiResponse<Category> {
  return normalize<Category>(localDb.categories as Category[]);
}

export function getLocalAds(): ApiResponse<Ad> {
  return normalize<Ad>(localDb.ads as Ad[]);
}
