// types/index.ts
export interface User {
  id: number;
  mobile_number: string;
  district: District;
  is_active: boolean;
  date_joined: string;
}

export interface CustomerProfile {
  id: number;
  mobile_number: string;
  district: District;
  whatsapp_link: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  count: number;
  next: null | string;
  previous: null | string;
  results: T[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  parent?: number | null;
}

export interface AdImage {
  id: number;
  image: string;
  image_url: string;
  caption: string;
  order: number;
  created_at: string;
}

export type AdCondition = "NEW" | "USED" | "IMPORTED" | "LOCAL";

export const ConditionLabels: Record<AdCondition, string> = {
  NEW: "🆕 Novo",
  USED: "♻️ Usado",
  IMPORTED: "📦 Importado",
  LOCAL: "🇸🇹 Produzido em São Tomé",
};

export const ConditionColors: Record<AdCondition, string> = {
  NEW: "bg-green-100 text-green-800",
  USED: "bg-blue-100 text-blue-800",
  IMPORTED: "bg-purple-100 text-purple-800",
  LOCAL: "bg-yellow-100 text-yellow-800",
};

export interface Ad {
  id: number;
  customer: CustomerProfile;
  category: Category | null;
  product_name: string;
  description: string;
  price: string | null;
  condition: AdCondition;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  is_featured: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
  images: AdImage[];
}

export interface TemporaryAd {
  id: number;
  session_token: string;
  category: Category | null;
  product_name: string;
  description: string;
  price: string | null;
  created_at: string;
  updated_at: string;
}

export type District =
  | "AGUA_GRANDE"
  | "CANTAGALO"
  | "CAUE"
  | "LEMBA"
  | "LOBATA"
  | "ME_ZOCHI"
  | "PAGUE"
  | "DIASPORA";

export const DistrictLabels: Record<District, string> = {
  AGUA_GRANDE: "Água Grande",
  CANTAGALO: "Cantagalo",
  CAUE: "Caué",
  LEMBA: "Lembá",
  LOBATA: "Lobata",
  ME_ZOCHI: "Mé-Zóchi",
  PAGUE: "Pagué",
  DIASPORA: "Diáspora",
};

export const DistrictEmojis: Record<District, string> = {
  AGUA_GRANDE: "🏙️",
  CANTAGALO: "🌊",
  CAUE: "🌴",
  LEMBA: "⛰️",
  LOBATA: "🏖️",
  ME_ZOCHI: "🌄",
  PAGUE: "🏝️",
  DIASPORA: "✈️",
};

export interface FilterState {
  search: string;
  category: string;
  district: string;
  condition?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
