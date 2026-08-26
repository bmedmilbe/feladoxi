// types/index.ts
export interface User {
  id: number;
  mobile_number: string;
  district: District;
  district_name?: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface AdminUser extends User {
  ad_count: number;
}

export interface CustomerProfile {
  id: number;
  mobile_number: string;
  district: District;
  district_name?: string;
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

export type AdvertisingRequestStatus =
  | "NEW"
  | "CONTACTED"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export interface AdvertisingRequest {
  id: number;
  campaign_type: "BRAND" | "PRODUCT";
  campaign_name: string;
  contact_name: string;
  contact_phone: string;
  objective: string;
  placements: string[];
  duration: string;
  preferred_start_date: string | null;
  target_url: string;
  description: string;
  contact_destination: string;
  status: AdvertisingRequestStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface AdminDashboard {
  ads: {
    total: number;
    active: number;
    featured: number;
  };
  categories: number;
  users: number;
  temporary_ads: number;
  advertising_requests: {
    total: number;
    new: number;
  };
  recent_requests: AdvertisingRequest[];
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
  NEW: "Novo",
  USED: "Usado",
  IMPORTED: "Importado",
  LOCAL: "Produzido em São Tomé",
};

export const ConditionColors: Record<AdCondition, string> = {
  NEW: "bg-green-100 text-green-800",
  USED: "bg-blue-100 text-blue-800",
  IMPORTED: "bg-purple-100 text-purple-800",
  LOCAL: "bg-yellow-100 text-yellow-800",
};

export interface Ad {
  id: number | string;
  customer: CustomerProfile;
  category: Category | null;
  product_name: string;
  description: string;
  price: string | null;
  original_price: string | null;
  condition: AdCondition;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  is_featured: boolean;
  featured_until: string | null;
  is_featured_active: boolean;
  is_on_sale: boolean;
  discount_percentage: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  images: AdImage[];
  is_demo?: boolean;
}

export interface TemporaryAd {
  id: string;
  category: number | null;
  product_name: string;
  description: string;
  price: string | null;
  original_price: string | null;
  condition: AdCondition;
  temporary_images: TemporaryAdImage[];
  created_at: string;
  updated_at: string;
}

export interface TemporaryAdImage {
  id: number;
  image: string;
  image_url: string;
  caption?: string;
  order?: number;
  created_at: string;
}

export type District =
  | "AGUA_GRANDE"
  | "CANTAGALO"
  | "CAUE"
  | "LEMBA"
  | "LOBATA"
  | "ME_ZOCHI"
  | "PAGUE"
  | "DIASPORA"
  | "UNKNOWN";

export const DistrictLabels: Record<District, string> = {
  AGUA_GRANDE: "Água Grande",
  CANTAGALO: "Cantagalo",
  CAUE: "Caué",
  LEMBA: "Lemba",
  LOBATA: "Lobata",
  ME_ZOCHI: "Mé-Zóchi",
  PAGUE: "Pague",
  DIASPORA: "Diáspora",
  UNKNOWN: "Distrito não informado",
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
  UNKNOWN: "",
};

export interface FilterState {
  search: string;
  category: string;
  district: string;
  condition?: string;
  featured?: string;
}
