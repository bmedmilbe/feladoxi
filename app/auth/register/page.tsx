// app/auth/register/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { DistrictLabels } from "@/types";
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

function RegisterForm() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingAd, setHasPendingAd] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<"form" | "success">(
    "form",
  );
  const [formData, setFormData] = useState({
    country_code: "+239",
    mobile_number: "",
    district: "",
  });
  const [smsSent, setSmsSent] = useState(false);

  // Check for pending ad
  useEffect(() => {
    const pendingToken = localStorage.getItem("pending_ad_token");
    if (pendingToken) {
      setHasPendingAd(true);
    }
  }, []);

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

    // Validate district
    if (!formData.district) {
      toast.error("Por favor, selecione seu distrito");
      setIsLoading(false);
      return;
    }

    try {
      // Register without PIN - backend will generate and send it
      await register(fullNumber, formData.district);

      // Show success state
      setRegistrationStep("success");
      setSmsSent(true);

      // Show toast notification
      toast.success("📱 PIN enviado por SMS! Verifique seu telefone.");

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error: any) {
      console.error("Registration error:", error);
      // Error is already handled in auth context with toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Success State */}
        {registrationStep === "success" ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4">
                <span className="text-5xl">✅</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Conta Criada com Sucesso!
            </h2>
            <p className="text-gray-600 mb-4">
              Enviamos um PIN de 4 dígitos por SMS para o número{" "}
              <strong>
                {formData.country_code}
                {formData.mobile_number}
              </strong>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                📱 Por favor, verifique seu telefone e insira o PIN na tela de
                login.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/auth/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Ir para Login
              </button>
              {hasPendingAd && (
                <p className="text-xs text-yellow-600">
                  📝 Seu rascunho será publicado após o login
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-3xl">📝</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
              <p className="text-gray-500 mt-2 text-sm">
                {hasPendingAd
                  ? "Cadastre-se para publicar seu anúncio rascunho"
                  : "Cadastre-se para começar a anunciar"}
              </p>
              {hasPendingAd && (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <p className="text-xs text-yellow-800">
                    📝 Você tem um rascunho de anúncio que será publicado após o
                    cadastro
                  </p>
                </div>
              )}
            </div>

            {/* Registration Form */}
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
                        setFormData({
                          ...formData,
                          country_code: e.target.value,
                        })
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
                  Selecione o código do país e insira o número sem zeros à
                  frente
                </p>
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>
                      Um PIN de 4 dígitos será enviado por SMS para este número
                    </span>
                  </p>
                </div>
              </div>

              {/* District */}
              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Distrito <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  required
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors h-[52px]"
                >
                  <option value="">Selecione seu distrito</option>
                  {Object.entries(DistrictLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
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
                    Enviando PIN...
                  </>
                ) : hasPendingAd ? (
                  "📤 Cadastrar e Publicar Rascunho"
                ) : (
                  "Cadastrar"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-500">
                Já tem uma conta?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
