// context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  fetchCurrentUser,
  getApiErrorMessage,
  publishTemporaryAd,
} from "@/lib/api";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface AuthContextType {
  user: { id: number; mobile_number: string; district: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    mobile_number: string,
    pin: string,
    pending_ad_token?: string,
  ) => Promise<void>;
  register: (mobile_number: string, district: string) => Promise<void>;
  logout: () => void;
  hasPendingAd: boolean;
  pendingAdData: {
    token: string;
    product_name: string;
    created_at: string;
  } | null;
  clearPendingAd: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{
    id: number;
    mobile_number: string;
    district: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAdData, setPendingAdData] = useState<{
    token: string;
    product_name: string;
    created_at: string;
  } | null>(null);
  const router = useRouter();
  const { tr } = useLanguage();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");
    const mobileNumber = localStorage.getItem("mobile_number");
    const district = localStorage.getItem("district");

    if (token && userId && mobileNumber) {
      setUser({
        id: parseInt(userId),
        mobile_number: mobileNumber,
        district: district!,
      });
    }

    // Check for pending ad
    const pendingToken = localStorage.getItem("pending_ad_token");
    const pendingData = localStorage.getItem("pending_ad_data");
    if (pendingToken && pendingData) {
      try {
        const data = JSON.parse(pendingData);
        setPendingAdData({
          token: pendingToken,
          product_name: data.product_name || "produto",
          created_at: data.created_at || new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error parsing pending ad data:", error);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (
    mobile_number: string,
    pin: string,
    pending_ad_token?: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await apiLogin({ mobile_number, pin });

      // Store authentication data
      localStorage.setItem("auth_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      const currentUser = await fetchCurrentUser();
      const district = localStorage.getItem("district") || "";
      localStorage.setItem("user_id", String(currentUser.id));
      localStorage.setItem("mobile_number", currentUser.mobile_number);
      localStorage.removeItem("last_registered_mobile_number");

      setUser({
        id: currentUser.id,
        mobile_number: currentUser.mobile_number,
        district,
      });

      // Handle pending ad transfer
      if (pending_ad_token) {
        const publishedAd = await publishTemporaryAd(pending_ad_token);
        // Clear pending ad data from localStorage
        localStorage.removeItem("pending_ad_token");
        localStorage.removeItem("pending_ad_data");
        setPendingAdData(null);

        toast.success(tr("O anúncio guardado foi publicado com sucesso", "Your saved listing was published successfully"));

        // Redirect to the newly created ad
        router.push(`/ads/${publishedAd.id}`);
        return; // Exit early to avoid double redirect
      }

      toast.success(tr("Sessão iniciada com sucesso", "Signed in successfully"));
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error);
      const apiMessage = getApiErrorMessage(error);
      const invalidAccount = apiMessage?.toLowerCase().includes(
        "no active account found",
      );
      const errorMessage = invalidAccount
        ? tr(
            "Não foi possível entrar. Confirme o número e o PIN. Se criou a conta agora, ela pode ainda não estar ativa no servidor.",
            "Unable to sign in. Check the number and PIN. If you just created the account, it may not be active on the server yet.",
          )
        : apiMessage ||
          tr("Não foi possível entrar. Verifique o número e o PIN.", "Unable to sign in. Check your number and PIN.");
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (mobile_number: string, district: string) => {
    setIsLoading(true);
    try {
      await apiRegister(mobile_number, district);

      // Check if there's a pending ad to transfer after registration
      const pendingToken = localStorage.getItem("pending_ad_token");
      if (pendingToken) {
        toast.success(tr("O rascunho será publicado depois do primeiro acesso", "The draft will be published after your first sign-in"));
      }

      toast.success(tr("Conta criada com sucesso", "Account created successfully"));
    } catch (error: any) {
      console.error("Register error:", error);
      const errorMessage =
        getApiErrorMessage(error) || tr("Não foi possível criar a conta. Tente novamente.", "Unable to create the account. Please try again.");
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    toast.success(tr("Sessão encerrada", "Signed out"));
    router.push("/");
  };

  const clearPendingAd = () => {
    localStorage.removeItem("pending_ad_token");
    localStorage.removeItem("pending_ad_data");
    setPendingAdData(null);
    toast.success(tr("Rascunho descartado", "Draft discarded"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasPendingAd: !!pendingAdData,
        pendingAdData,
        clearPendingAd,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
