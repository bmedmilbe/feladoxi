import axios from "axios";
import type { Ad, ApiResponse, Category, FilterState } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("mobile_number");
      localStorage.removeItem("district");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

// Categories
export async function fetchCategories(): Promise<ApiResponse<Category>> {
  const response = await api.get<ApiResponse<Category>>(
    "/marketplace/categories/",
  );
  return response.data;
}

// Ads
export async function fetchAds(filters: FilterState): Promise<ApiResponse<Ad>> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.district) params.set("district", filters.district);
  if (filters.condition) params.set("condition", filters.condition);

  const response = await api.get<ApiResponse<Ad>>(
    `/marketplace/ads/?${params.toString()}`,
  );
  return response.data;
}

export async function fetchAd(id: number): Promise<Ad> {
  const response = await api.get<Ad>(`/marketplace/ads/${id}/`);
  return response.data;
}

export async function createAd(data: FormData): Promise<Ad> {
  const response = await api.post<Ad>("/marketplace/ads/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateAd(id: number, data: FormData): Promise<Ad> {
  const response = await api.put<Ad>(`/marketplace/ads/${id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deleteAd(id: number): Promise<void> {
  await api.delete(`/marketplace/ads/${id}/`);
}

// Temporary Ads (Guest Flow)
export async function createTemporaryAd(
  data: FormData,
): Promise<{ session_token: string; ad: any }> {
  const response = await api.post("/marketplace/guest/temporary-ads/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateTemporaryAd(
  data: FormData,
): Promise<{ session_token: string; ad: any }> {
  const response = await api.put("/marketplace/guest/temporary-ads/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deleteTemporaryAd(session_token: string): Promise<void> {
  await api.delete("/marketplace/guest/temporary-ads/", {
    data: { session_token },
  });
}
export async function login(payload: {
  mobile_number: string;
  pin: string;
  pending_ad_token?: string;
}): Promise<{
  token: string;
  user_id: number;
  mobile_number: string;
  district: string;
  transferred_ad_id: number | null;
}> {
  const response = await api.post("/auth/login/", payload);
  return response.data;
}

export async function register(
  mobile_number: string,
  district: string,
): Promise<{
  message: string;
  mobile_number: string;
  district: string;
  pin_sent: boolean;
}> {
  const response = await api.post("/auth/register/", {
    mobile_number,
    district,
  });
  return response.data;
}

export async function changePin(
  old_pin: string,
  new_pin: string,
): Promise<{
  message: string;
  mobile_number: string;
}> {
  const response = await api.post("/auth/change-pin/", {
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
}
