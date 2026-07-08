// app/auth/register/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { DistrictLabels } from "@/types";
import toast from "react-hot-toast";

function RegisterForm() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingAd, setHasPendingAd] = useState(false);
  const [formData, setFormData] = useState({
    mobile_number: "",
    district: "",
    pin: "",
    confirm_pin: "",
  });
  const [showPinHelp, setShowPinHelp] = useState(false);

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

    // Validate mobile number
    if (!formData.mobile_number.trim()) {
      toast.error("Por favor, insira seu número de telefone");
      setIsLoading(false);
      return;
    }

    // Validate district
    if (!formData.district) {
      toast.error("Por favor, selecione seu distrito");
      setIsLoading(false);
      return;
    }

    // Validate PIN
    if (!formData.pin || formData.pin.length !== 4) {
      toast.error("Por favor, insira um PIN de 4 dígitos");
      setIsLoading(false);
      return;
    }

    // Validate PIN confirmation
    if (formData.pin !== formData.confirm_pin) {
      toast.error("Os PINs não coincidem");
      setIsLoading(false);
      return;
    }

    try {
      await register(
        formData.mobile_number.trim(),
        formData.district,
        formData.pin,
      );

      // After registration, redirect to login with success message
      toast.success(
        "Cadastro realizado com sucesso! Faça login para continuar.",
      );
      router.push("/auth/login");
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
          {/* Mobile Number */}
          <div>
            <label
              htmlFor="mobile_number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Telefone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                📱
              </span>
              <input
                id="mobile_number"
                type="tel"
                required
                autoComplete="tel"
                placeholder="Ex: 987654321"
                value={formData.mobile_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobile_number: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Insira o número sem o código do país (ex: 987654321)
            </p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            >
              <option value="">Selecione seu distrito</option>
              {Object.entries(DistrictLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors tracking-[0.5em] text-center text-xl"
                inputMode="numeric"
              />
            </div>
            {showPinHelp && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p>
                  O PIN é um código de 4 dígitos que você usará para fazer
                  login.
                </p>
                <p className="mt-1">
                  Escolha um PIN fácil de lembrar, mas seguro.
                </p>
              </div>
            )}
          </div>

          {/* Confirm PIN */}
          <div>
            <label
              htmlFor="confirm_pin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmar PIN <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                ✓
              </span>
              <input
                id="confirm_pin"
                type="password"
                required
                maxLength={4}
                autoComplete="off"
                placeholder="• • • •"
                value={formData.confirm_pin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirm_pin: e.target.value.replace(/\D/g, "").slice(0, 4),
                  })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors tracking-[0.5em] text-center text-xl"
                inputMode="numeric"
              />
            </div>
            {formData.pin &&
              formData.confirm_pin &&
              formData.pin !== formData.confirm_pin && (
                <p className="mt-1 text-xs text-red-500">
                  ⚠️ Os PINs não coincidem
                </p>
              )}
            {formData.pin &&
              formData.confirm_pin &&
              formData.pin === formData.confirm_pin && (
                <p className="mt-1 text-xs text-green-500">✅ PINs coincidem</p>
              )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                Cadastrando...
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
