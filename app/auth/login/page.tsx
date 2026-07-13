// app/auth/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// List of country codes for dropdown
const COUNTRY_CODES = [
  { code: "+239", label: "🇸🇹 +239 (São Tomé e Príncipe)" },
  { code: "+351", label: "🇵🇹 +351 (Portugal)" },
  { code: "+55", label: "🇧🇷 +55 (Brasil)" },
  { code: "+244", label: "🇦🇴 +244 (Angola)" },
  { code: "+238", label: "🇨🇻 +238 (Cabo Verde)" },
  { code: "+245", label: "🇬🇼 +245 (Guiné-Bissau)" },
  { code: "+258", label: "🇲🇿 +258 (Moçambique)" },
  { code: "+1", label: "🇺🇸 +1 (EUA/Canadá)" },
  { code: "+44", label: "🇬🇧 +44 (Reino Unido)" },
  { code: "+33", label: "🇫🇷 +33 (França)" },
  { code: "+34", label: "🇪🇸 +34 (Espanha)" },
  { code: "+49", label: "🇩🇪 +49 (Alemanha)" },
  { code: "+39", label: "🇮🇹 +39 (Itália)" },
  { code: "+31", label: "🇳🇱 +31 (Países Baixos)" },
  { code: "+32", label: "🇧🇪 +32 (Bélgica)" },
  { code: "+41", label: "🇨🇭 +41 (Suíça)" },
  { code: "+86", label: "🇨🇳 +86 (China)" },
  { code: "+81", label: "🇯🇵 +81 (Japão)" },
  { code: "+91", label: "🇮🇳 +91 (Índia)" },
  { code: "+27", label: "🇿🇦 +27 (África do Sul)" },
  { code: "+234", label: "🇳🇬 +234 (Nigéria)" },
  { code: "+254", label: "🇰🇪 +254 (Quénia)" },
  { code: "+256", label: "🇺🇬 +256 (Uganda)" },
  { code: "+250", label: "🇷🇼 +250 (Ruanda)" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAd, setPendingAd] = useState<{
    token: string;
    product_name: string;
    created_at: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    country_code: "+239",
    mobile_number: "",
    pin: "",
  });
  const [showPinHelp, setShowPinHelp] = useState(false);

  // Check for pending ad on page load
  useEffect(() => {
    const pendingAdToken = localStorage.getItem("pending_ad_token");
    const pendingAdData = localStorage.getItem("pending_ad_data");

    if (pendingAdToken && pendingAdData) {
      try {
        const data = JSON.parse(pendingAdData);
        setPendingAd({
          token: pendingAdToken,
          product_name: data.product_name || "produto",
          created_at: data.created_at || new Date().toISOString(),
        });
      } catch (error) {
        console.error("Erro ao ler dados do rascunho:", error);
      }
    }

    // Check URL param for pending ad indicator
    const pending = searchParams.get("pending_ad");
    if (pending === "true" && !pendingAdToken) {
      toast.info("Você tem um anúncio rascunho. Faça login para publicá-lo!");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate mobile number with country code
    const fullNumber = formData.country_code + formData.mobile_number;

    if (!formData.mobile_number.trim()) {
      toast.error("Por favor, insira seu número de telefone");
      setIsLoading(false);
      return;
    }

    // Validate minimum phone number length (without country code)
    if (formData.mobile_number.trim().length < 6) {
      toast.error("Por favor, insira um número de telefone válido");
      setIsLoading(false);
      return;
    }

    // Validate PIN
    if (!formData.pin || formData.pin.length !== 4) {
      toast.error("Por favor, insira o PIN de 4 dígitos");
      setIsLoading(false);
      return;
    }

    try {
      // Check for pending ad token in localStorage
      const pendingAdToken = localStorage.getItem("pending_ad_token");

      // Pass pending_ad_token if exists
      await login(
        fullNumber, // Send full number with country code
        formData.pin,
        pendingAdToken || undefined,
      );

      // Clear pending ad data after successful login
      if (pendingAdToken) {
        localStorage.removeItem("pending_ad_token");
        localStorage.removeItem("pending_ad_data");
        toast.success("Seu anúncio rascunho foi publicado com sucesso!");
      }

      // Redirect to dashboard/home
      router.push("/");
    } catch (error: any) {
      // Error handled in auth context with toast
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPendingAd = () => {
    localStorage.removeItem("pending_ad_token");
    localStorage.removeItem("pending_ad_data");
    setPendingAd(null);
    toast.success("Rascunho descartado");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "data desconhecida";
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {pendingAd
              ? `Faça login para publicar "${pendingAd.product_name}"`
              : "Acesse sua conta para gerenciar seus anúncios"}
          </p>
        </div>

        {/* Pending Ad Banner */}
        {pendingAd && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">📝</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Rascunho de anúncio encontrado
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  <strong>Produto:</strong> {pendingAd.product_name}
                </p>
                <p className="text-xs text-yellow-700">
                  <strong>Criado em:</strong> {formatDate(pendingAd.created_at)}
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Faça login para publicar este anúncio automaticamente
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleClearPendingAd}
                className="text-xs text-yellow-600 hover:text-yellow-800 transition-colors underline"
              >
                Descartar rascunho
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mobile Number with Country Code */}
          <div>
            <label
              htmlFor="mobile_number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Telefone <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {/* Country Code Dropdown */}
              <div className="relative flex-shrink-0">
                <select
                  id="country_code"
                  value={formData.country_code}
                  onChange={(e) =>
                    setFormData({ ...formData, country_code: e.target.value })
                  }
                  className="h-[52px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors bg-white appearance-none pr-8 min-w-[120px]"
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  ▼
                </span>
              </div>

              {/* Phone Number Input */}
              <div className="relative flex-1">
                <input
                  id="mobile_number"
                  type="tel"
                  required
                  autoComplete="tel-national"
                  placeholder="987654321"
                  value={formData.mobile_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mobile_number: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors h-[52px]"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Selecione o código do país e insira o número sem zeros à frente
            </p>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <span>💡</span>
              <span>Exemplo: +239 987654321</span>
            </div>
          </div>

          {/* PIN */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="pin"
                className="block text-sm font-medium text-gray-700"
              >
                PIN (4 dígitos) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPinHelp(!showPinHelp)}
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showPinHelp ? "Ocultar" : "O que é o PIN?"}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔑
              </span>
              <input
                id="pin"
                type="password"
                required
                maxLength={4}
                autoComplete="off"
                placeholder="• • • •"
                value={formData.pin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pin: e.target.value.replace(/\D/g, "").slice(0, 4),
                  })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors tracking-[0.5em] text-center text-xl h-[52px]"
                inputMode="numeric"
              />
            </div>
            {showPinHelp && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p>
                  O PIN é um código de 4 dígitos enviado por SMS durante o
                  cadastro.
                </p>
                <p className="mt-1">
                  Se você não recebeu o PIN, verifique seu número de telefone ou
                  entre em contato com o suporte.
                </p>
              </div>
            )}
          </div>

          {/* Resend PIN Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => {
                const fullNumber =
                  formData.country_code + formData.mobile_number;
                if (!formData.mobile_number.trim()) {
                  toast.error(
                    "Por favor, insira seu número de telefone para reenviar o PIN",
                  );
                  return;
                }
                if (formData.mobile_number.trim().length < 6) {
                  toast.error("Por favor, insira um número de telefone válido");
                  return;
                }
                // Call resend PIN API
                fetch("/api/auth/resend-pin/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ mobile_number: fullNumber }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.message) {
                      toast.success(
                        "PIN reenviado por SMS! Verifique seu telefone.",
                      );
                    } else {
                      toast.error(data.error || "Erro ao reenviar PIN");
                    }
                  })
                  .catch(() => {
                    toast.error("Erro ao reenviar PIN. Tente novamente.");
                  });
              }}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              Não recebeu o PIN? Reenviar
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[52px]"
          >
            {isLoading || authLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {pendingAd ? "Publicando anúncio..." : "Entrando..."}
              </>
            ) : pendingAd ? (
              "📤 Publicar Anúncio e Entrar"
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Registration Link */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            Não tem uma conta?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Cadastre-se
            </Link>
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400">ou</span>
          </div>
        </div>

        {/* Guest Continue */}
        <div className="text-center">
          <Link
            href="/ads/create"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
          >
            <span>👤</span>
            Continuar como visitante
          </Link>
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
