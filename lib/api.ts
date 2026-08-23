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
  return url.replace(
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

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL?.trim() || "/api/proxy").replace(/\/$/, "");

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
    config.headers.Authorization = `Bearer ${token}`;
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
  return normalizeApiResponse<Ad>(response.data);
}

export async function fetchAd(id: number): Promise<Ad> {
  const response = await api.get<Ad>(buildApiUrl(`/marketplace/ads/${id}/`));
  return normalizeTextFields(response.data);
}

export async function createAd(data: FormData): Promise<Ad> {
  const response = await api.post<Ad>(
    buildApiUrl("/marketplace/ads/"),
    data,
    multipartConfig,
  );
  return response.data;
}

export async function updateAd(id: number, data: FormData): Promise<Ad> {
  const response = await api.put<Ad>(
    buildApiUrl(`/marketplace/ads/${id}/`),
    data,
    multipartConfig,
  );
  return response.data;
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

  return normalizeTextFields(response.data);
}

export async function deleteAd(id: number): Promise<void> {
  await api.delete(buildApiUrl(`/marketplace/ads/${id}/`));
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
  return normalizeTextFields(response.data);
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

  return normalizeTextFields(response.data);
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
}> {
  const response = await api.get(buildApiUrl("/auth/users/me/"));
  return normalizeTextFields(response.data);
}

export async function publishTemporaryAd(tempAdId: string): Promise<Ad> {
  const response = await api.post<Ad>(
    buildApiUrl("/marketplace/manage/ads/"),
    { temp_ad_id: tempAdId },
  );
  return normalizeTextFields(response.data);
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
  });
  if (isBrowser) window.localStorage.setItem("district", district);
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
