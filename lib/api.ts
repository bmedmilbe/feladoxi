import axios from "axios";
import type {
  Ad,
  AdImage,
  ApiResponse,
  Category,
  FilterState,
  TemporaryAd,
  TemporaryAdImage,
} from "@/types";
import demoDraftManifest from "@/data/test-product-drafts.json";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL?.trim() || "/api/proxy").replace(/\/$/, "");
const REMOTE_API_ORIGIN = API_BASE_URL.startsWith("http")
  ? new URL(API_BASE_URL).origin
  : "https://easyadapp-production.up.railway.app";

const demoContactNumber = "+2399940219";
const demoCategoryImages: Record<string, string> = {
  cacau: "/images/category-local-products.png",
  cafe: "/images/category-local-products.png",
  frutas: "/images/category-local-products.png",
  telemoveis: "/images/category-electronics.png",
  computadores: "/images/category-electronics.png",
  bicicletas:
    "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=82",
  moveis:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=82",
  calcado: "/images/category-fashion.png",
  carros:
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=82",
  casas:
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=82",
};

const localProductCategories = new Set(["cacau", "cafe", "frutas"]);
const usedProductCategories = new Set(["bicicletas", "carros"]);

const windows1252Bytes: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function repairMojibake(text: string): string {
  if (!/[ÃÂâð]/.test(text)) return text;

  const bytes = Array.from(text, (character) => {
    const codePoint = character.codePointAt(0) || 0;
    return windows1252Bytes[codePoint] ?? codePoint;
  });

  if (bytes.some((byte) => byte > 0xff)) return text;

  const repaired = new TextDecoder("utf-8", { fatal: false }).decode(
    Uint8Array.from(bytes),
  );

  return repaired.includes("\uFFFD") ? text : repaired;
}

function normalizeTextFields<T>(value: T): T {
  if (typeof value === "string") {
    return repairMojibake(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeTextFields(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        key === "image_url" && typeof item === "string"
          ? normalizeMediaUrl(item)
          : normalizeTextFields(item),
      ]),
    ) as T;
  }

  return value;
}

function normalizeMediaUrl(url: string): string {
  const normalizedUrl = repairMojibake(url).trim();
  if (!normalizedUrl || normalizedUrl.startsWith("/images/")) return normalizedUrl;

  if (normalizedUrl.startsWith("//")) {
    return `https:${normalizedUrl}`;
  }

  if (!/^https?:\/\//i.test(normalizedUrl)) {
    return `${REMOTE_API_ORIGIN}/${normalizedUrl.replace(/^\/+/, "")}`;
  }

  return normalizedUrl.replace(
    /^http:\/\/([^/]+\.up\.railway\.app)(?=\/)/i,
    "https://$1",
  );
}

function normalizeApiResponse<T>(data: any): ApiResponse<T> {
  const normalizedData = normalizeTextFields(data);

  if (Array.isArray(normalizedData)) {
    return { count: normalizedData.length, next: null, previous: null, results: normalizedData as T[] };
  }

  if (normalizedData && Array.isArray(normalizedData.results)) {
    return normalizedData as ApiResponse<T>;
  }

  return { count: 0, next: null, previous: null, results: [] as T[] };
}

function buildApiUrl(path: string): string {
  const cleanPath = path.replace(/^\/+/, "");
  if (API_BASE_URL === "/api/proxy" || API_BASE_URL.endsWith("/api/proxy")) {
    return `${API_BASE_URL}?path=${encodeURIComponent(`/${cleanPath}`)}`;
  }
  return `${API_BASE_URL}/${cleanPath}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

const isBrowser = typeof window !== "undefined";

function getStoredItem(key: string): string | null {
  if (!isBrowser) return null;
  return window.localStorage.getItem(key);
}

function normalizeAdImage(value: unknown, index: number): AdImage | null {
  if (!value || typeof value !== "object") return null;

  const image = normalizeTextFields(value) as Record<string, unknown>;
  const source =
    typeof image.image_url === "string"
      ? image.image_url
      : typeof image.image === "string"
        ? image.image
        : "";
  const imageUrl = normalizeMediaUrl(source);
  if (!imageUrl) return null;

  return {
    id: typeof image.id === "number" ? image.id : -(index + 1),
    image: typeof image.image === "string" ? normalizeMediaUrl(image.image) : imageUrl,
    image_url: imageUrl,
    caption: typeof image.caption === "string" ? image.caption : "",
    order: typeof image.order === "number" ? image.order : index,
    created_at: typeof image.created_at === "string" ? image.created_at : "",
  };
}

function normalizeAd(value: unknown): Ad {
  const ad = normalizeTextFields(value) as Record<string, any>;
  const customer = ad.customer && typeof ad.customer === "object" ? ad.customer : {};
  const apiDistrict = [
    customer.district,
    customer.district_code,
  ].find((district) => typeof district === "string" && district.trim());
  const district = apiDistrict || "UNKNOWN";
  const images = Array.isArray(ad.images)
    ? ad.images
        .map((image: unknown, index: number) => normalizeAdImage(image, index))
        .filter((image: AdImage | null): image is AdImage => image !== null)
    : [];
  const price = ad.price === null || ad.price === undefined ? null : String(ad.price);
  const originalPrice =
    ad.original_price === null || ad.original_price === undefined
      ? null
      : String(ad.original_price);
  const isOnSale = Boolean(
    originalPrice && price && Number(originalPrice) > Number(price),
  );
  const discountPercentage = isOnSale
    ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
    : 0;
  const featuredUntil =
    typeof ad.featured_until === "string" ? ad.featured_until : null;
  const isFeaturedActive = Boolean(
    ad.is_featured &&
      (!featuredUntil || new Date(featuredUntil).getTime() > Date.now()),
  );

  return {
    ...ad,
    customer: {
      ...customer,
      district,
    },
    price,
    original_price: originalPrice,
    featured_until: featuredUntil,
    is_featured_active:
      typeof ad.is_featured_active === "boolean"
        ? ad.is_featured_active
        : isFeaturedActive,
    is_on_sale:
      typeof ad.is_on_sale === "boolean" ? ad.is_on_sale : isOnSale,
    discount_percentage:
      typeof ad.discount_percentage === "number"
        ? ad.discount_percentage
        : discountPercentage,
    images,
  } as Ad;
}

function normalizeAdResponse(data: unknown): ApiResponse<Ad> {
  const response = normalizeApiResponse<Record<string, unknown>>(data);
  return {
    ...response,
    results: response.results.map(normalizeAd),
  };
}

function normalizeTemporaryAd(value: unknown): TemporaryAd {
  const draft = normalizeTextFields(value) as Record<string, any>;
  const temporaryImages = Array.isArray(draft.temporary_images)
    ? draft.temporary_images
        .map((image: unknown, index: number) => normalizeAdImage(image, index))
        .filter((image: AdImage | null): image is AdImage => image !== null)
    : [];

  return {
    ...draft,
    temporary_images: temporaryImages,
  } as TemporaryAd;
}

function clearAuthStorage(): void {
  if (!isBrowser) return;
  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("user_id");
  window.localStorage.removeItem("mobile_number");
  window.localStorage.removeItem("district");
  window.localStorage.removeItem("refresh_token");
}

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = getStoredItem("auth_token");
  if (token) {
    config.headers.Authorization = `JWT ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      if (isBrowser) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

// Categories
export async function fetchCategories(): Promise<ApiResponse<Category>> {
  const categories: Category[] = [];
  const visitedPages = new Set<string>();
  let nextPageUrl: string | null = buildApiUrl("/marketplace/categories/");

  while (nextPageUrl && !visitedPages.has(nextPageUrl)) {
    visitedPages.add(nextPageUrl);

    const response: { data: any } = await api.get<any>(nextPageUrl);
    const page = normalizeApiResponse<Category>(response.data);
    categories.push(...page.results);
    nextPageUrl = page.next ? normalizeMediaUrl(page.next) : null;
  }

  return {
    count: categories.length,
    next: null,
    previous: null,
    results: categories,
  };
}

async function fetchTemporaryAd(id: string): Promise<TemporaryAd> {
  const response = await api.get<TemporaryAd>(
    buildApiUrl(`/marketplace/guest/temporary-ads/${id}/`),
  );
  return normalizeTemporaryAd(response.data);
}

function buildDemoAd(
  draft: TemporaryAd,
  category: Category | null,
  index: number,
): Ad {
  const fallbackImage = category?.slug
    ? demoCategoryImages[category.slug]
    : undefined;
  const images: AdImage[] = (draft.temporary_images || []).map(
    (image, imageIndex) => ({
      id: image.id,
      image: image.image,
      image_url: image.image_url,
      caption: image.caption || draft.product_name,
      order: image.order ?? imageIndex,
      created_at: image.created_at,
    }),
  );

  if (images.length === 0 && fallbackImage) {
    images.push({
      id: -(index + 1),
      image: fallbackImage,
      image_url: fallbackImage,
      caption: draft.product_name,
      order: 0,
      created_at: draft.created_at,
    });
  }

  const expiresAt = new Date(draft.created_at);
  expiresAt.setDate(expiresAt.getDate() + 90);
  const categorySlug = category?.slug || "";
  const condition: Ad["condition"] =
    draft.condition ||
    (localProductCategories.has(categorySlug)
      ? "LOCAL"
      : usedProductCategories.has(categorySlug)
        ? "USED"
        : "NEW");

  return {
    id: draft.id,
    customer: {
      id: -1,
      mobile_number: demoContactNumber,
      district: "AGUA_GRANDE",
      whatsapp_link: `https://wa.me/${demoContactNumber.replace(/\D/g, "")}`,
      created_at: draft.created_at,
      updated_at: draft.updated_at,
    },
    category,
    product_name: draft.product_name,
    description: draft.description,
    price: draft.price,
    original_price: draft.original_price,
    condition,
    status: "ACTIVE",
    is_featured: index < 2,
    featured_until: null,
    is_featured_active: index < 2,
    is_on_sale: Boolean(
      draft.original_price &&
        draft.price &&
        Number(draft.original_price) > Number(draft.price),
    ),
    discount_percentage:
      draft.original_price &&
      draft.price &&
      Number(draft.original_price) > Number(draft.price)
        ? Math.round(
            (1 - Number(draft.price) / Number(draft.original_price)) * 100,
          )
        : 0,
    expires_at: expiresAt.toISOString(),
    created_at: draft.created_at,
    updated_at: draft.updated_at,
    images,
    is_demo: true,
  };
}

function filterAds(ads: Ad[], filters: FilterState): Ad[] {
  const search = filters.search.trim().toLocaleLowerCase("pt");

  return ads.filter((ad) => {
    const matchesSearch =
      !search ||
      `${ad.product_name} ${ad.description} ${ad.category?.name || ""}`
        .toLocaleLowerCase("pt")
        .includes(search);
    const matchesCategory =
      !filters.category ||
      ad.category?.slug === filters.category ||
      String(ad.category?.id) === filters.category;
    const matchesDistrict =
      !filters.district || ad.customer.district === filters.district;
    const matchesCondition =
      !filters.condition || ad.condition === filters.condition;
    const matchesFeatured =
      !filters.featured ||
      String(ad.is_featured_active) === filters.featured;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDistrict &&
      matchesCondition &&
      matchesFeatured
    );
  });
}

async function fetchDemoAds(filters: FilterState): Promise<ApiResponse<Ad>> {
  const [categories, draftResults] = await Promise.all([
    fetchCategories(),
    Promise.allSettled(
      demoDraftManifest.products.map((product) => fetchTemporaryAd(product.id)),
    ),
  ]);
  const categoryMap = new Map(
    categories.results.map((category) => [category.id, category]),
  );
  const demoAds = draftResults.flatMap((result, index) => {
    if (result.status !== "fulfilled") return [];
    return [
      buildDemoAd(
        result.value,
        result.value.category
          ? categoryMap.get(result.value.category) || null
          : null,
        index,
      ),
    ];
  });
  const filteredAds = filterAds(demoAds, filters);

  return {
    count: filteredAds.length,
    next: null,
    previous: null,
    results: filteredAds,
  };
}

// Ads
export async function fetchAds(filters: FilterState): Promise<ApiResponse<Ad>> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.district) params.set("district", filters.district);
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.featured) params.set("featured", filters.featured);

  const path = `/marketplace/ads/?${params.toString()}`;
  const response = await api.get<any>(buildApiUrl(path));
  const publishedResponse = normalizeAdResponse(response.data);
  const filteredPublishedAds = filterAds(publishedResponse.results, filters);
  const publishedAds = {
    ...publishedResponse,
    count: filteredPublishedAds.length,
    next: null,
    previous: null,
    results: filteredPublishedAds,
  };
  if (publishedAds.results.length > 0) return publishedAds;

  const hasFilters = Array.from(params.keys()).length > 0;
  if (hasFilters) {
    const allPublishedResponse = await api.get<any>(
      buildApiUrl("/marketplace/ads/"),
    );
    const allPublishedAds = normalizeAdResponse(allPublishedResponse.data);
    if (allPublishedAds.count > 0) return publishedAds;
  }

  try {
    return await fetchDemoAds(filters);
  } catch {
    return publishedAds;
  }
}

export async function fetchAd(id: number | string): Promise<Ad> {
  const stringId = String(id);
  const isDemoDraft = demoDraftManifest.products.some(
    (product) => product.id === stringId,
  );

  if (isDemoDraft) {
    const [draft, categories] = await Promise.all([
      fetchTemporaryAd(stringId),
      fetchCategories(),
    ]);
    const category =
      categories.results.find((item) => item.id === draft.category) || null;
    const index = demoDraftManifest.products.findIndex(
      (product) => product.id === stringId,
    );
    return buildDemoAd(draft, category, index);
  }

  const response = await api.get<Ad>(buildApiUrl(`/marketplace/ads/${id}/`));
  return normalizeAd(response.data);
}

export async function createAd(data: FormData): Promise<Ad> {
  const response = await api.post<Ad>(
    buildApiUrl("/marketplace/ads/"),
    data,
    multipartConfig,
  );
  return normalizeAd(response.data);
}

export async function updateAd(id: number, data: FormData): Promise<Ad> {
  const response = await api.patch<Ad>(
    buildApiUrl(`/marketplace/manage/ads/${id}/`),
    data,
    multipartConfig,
  );
  return normalizeAd(response.data);
}

export async function uploadAdImage(
  adId: number,
  image: File,
  order: number,
): Promise<AdImage> {
  const data = new FormData();
  data.append("image", image);
  data.append("order", String(order));

  const response = await api.post<AdImage>(
    buildApiUrl(`/marketplace/ads/${adId}/images/`),
    data,
    multipartConfig,
  );

  const normalizedImage = normalizeAdImage(response.data, order);
  if (!normalizedImage) throw new Error("The API did not return a valid image URL");
  return normalizedImage;
}

export async function deleteAd(id: Ad["id"]): Promise<void> {
  await api.delete(buildApiUrl(`/marketplace/manage/ads/${id}/`));
}

// Temporary Ads (Guest Flow)
export async function createTemporaryAd(
  data: FormData,
): Promise<TemporaryAd> {
  const response = await api.post<TemporaryAd>(
    buildApiUrl("/marketplace/guest/temporary-ads/"),
    data,
    multipartConfig,
  );
  return normalizeTemporaryAd(response.data);
}

export async function uploadTemporaryAdImage(
  temporaryAdId: string,
  image: File,
  order: number,
): Promise<TemporaryAdImage> {
  const data = new FormData();
  data.append("image", image);
  data.append("order", String(order));

  const response = await api.post<TemporaryAdImage>(
    buildApiUrl(
      `/marketplace/guest/temporary-ads/${temporaryAdId}/images/`,
    ),
    data,
    multipartConfig,
  );

  const normalizedImage = normalizeAdImage(response.data, order);
  if (!normalizedImage) throw new Error("The API did not return a valid image URL");
  return normalizedImage;
}

export async function login(payload: {
  mobile_number: string;
  pin: string;
}): Promise<{
  access: string;
  refresh: string;
}> {
  const response = await api.post(buildApiUrl("/auth/jwt/create/"), {
    mobile_number: payload.mobile_number,
    password: payload.pin,
  });
  return response.data;
}

export async function fetchCurrentUser(): Promise<{
  id: number;
  mobile_number: string;
  username: string;
  district?: string;
}> {
  const response = await api.get(buildApiUrl("/auth/users/me/"));
  return normalizeTextFields(response.data);
}

export async function publishTemporaryAd(tempAdId: string): Promise<Ad> {
  const response = await api.post<Ad>(
    buildApiUrl("/marketplace/manage/ads/"),
    { temp_ad_id: tempAdId },
  );
  return normalizeAd(response.data);
}

export async function register(
  mobile_number: string,
  district: string,
): Promise<{
  id: number;
  mobile_number: string;
}> {
  const response = await api.post(buildApiUrl("/auth/users/"), {
    mobile_number,
    district,
  });
  if (isBrowser) {
    window.localStorage.setItem("district", district);
    window.localStorage.setItem("last_registered_mobile_number", mobile_number);
  }
  return response.data;
}

export async function changePin(
  old_pin: string,
  new_pin: string,
): Promise<{
  message: string;
  mobile_number: string;
}> {
  const response = await api.post(buildApiUrl("/auth/change-pin/"), {
    old_pin,
    new_pin,
  });
  return response.data;
}

export function logout(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("mobile_number");
  localStorage.removeItem("district");
  localStorage.removeItem("refresh_token");
}

export function getApiErrorMessage(error: unknown): string | null {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  for (const key of ["error", "detail", "message", "non_field_errors"]) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
  }

  for (const [field, value] of Object.entries(record)) {
    if (typeof value === "string") return `${field}: ${value}`;
    if (Array.isArray(value) && value.length > 0) return `${field}: ${String(value[0])}`;
  }
  return null;
}
