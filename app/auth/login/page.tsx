"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/AuthShell";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PhoneField } from "@/components/PhoneField";
import { useAuth } from "@/context/AuthContext";
import { resendPin } from "@/lib/api";

interface PendingAd {
  token: string;
  product_name: string;
  created_at: string;
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const { login, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPinHelp, setShowPinHelp] = useState(false);
  const [pendingAd, setPendingAd] = useState<PendingAd | null>(null);
  const [formData, setFormData] = useState({
    country_code: "+239",
    mobile_number: "",
    pin: "",
  });

  useEffect(() => {
    const pendingAdToken = localStorage.getItem("pending_ad_token");
    const pendingAdData = localStorage.getItem("pending_ad_data");

    if (pendingAdToken && pendingAdData) {
      try {
        const data = JSON.parse(pendingAdData) as Partial<PendingAd>;
        setPendingAd({
          token: pendingAdToken,
          product_name: data.product_name || "produto",
          created_at: data.created_at || new Date().toISOString(),
        });
      } catch {
        localStorage.removeItem("pending_ad_data");
      }
    }

    if (searchParams.get("pending_ad") === "true" && !pendingAdToken) {
      toast("Tem um anúncio guardado. Entre para concluir a publicação.");
    }
  }, [searchParams]);

  const fullNumber = `${formData.country_code}${formData.mobile_number}`;

  const validatePhone = () => {
    if (!formData.mobile_number.trim()) {
      toast.error("Indique o seu número de telefone");
      return false;
    }
    if (formData.mobile_number.trim().length < 6) {
      toast.error("Indique um número de telefone válido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validatePhone()) return;
    if (formData.pin.length !== 4) {
      toast.error("O PIN deve ter 4 dígitos");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(fullNumber, formData.pin, pendingAd?.token);
    } catch {
      // O contexto apresenta a mensagem devolvida pela API.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendPin = async () => {
    if (!validatePhone()) return;

    setIsResending(true);
    try {
      await resendPin(fullNumber);
      toast.success("PIN reenviado por SMS");
    } catch (error) {
      const apiError = error as { response?: { data?: { error?: string } } };
      toast.error(apiError.response?.data?.error || "Não foi possível reenviar o PIN");
    } finally {
      setIsResending(false);
    }
  };

  const handleClearPendingAd = () => {
    localStorage.removeItem("pending_ad_token");
    localStorage.removeItem("pending_ad_data");
    setPendingAd(null);
    toast.success("Rascunho descartado");
  };

  const pendingDate = pendingAd
    ? new Date(pendingAd.created_at).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <AuthShell
      eyebrow="Bem-vindo de volta"
      title={pendingAd ? "Entre para publicar" : "Entrar na conta"}
      description={
        pendingAd
          ? `O rascunho “${pendingAd.product_name}” está pronto para ser associado à sua conta.`
          : "Use o seu número de telefone e o PIN recebido por SMS."
      }
    >
      {pendingAd && (
        <div className="mb-6 border-l-4 border-[#e7492f] bg-[#fff5ef] px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-[#0b2f27]">Rascunho encontrado</p>
              <p className="mt-1 text-xs leading-5 text-[#6d594f]">
                {pendingAd.product_name} · guardado em {pendingDate}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearPendingAd}
              className="shrink-0 text-xs font-bold text-[#a33a2a] hover:text-[#7f2e22]"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <PhoneField
          idPrefix="login"
          countryCode={formData.country_code}
          mobileNumber={formData.mobile_number}
          onCountryCodeChange={(value) =>
            setFormData((current) => ({ ...current, country_code: value }))
          }
          onMobileNumberChange={(value) =>
            setFormData((current) => ({ ...current, mobile_number: value }))
          }
        />

        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="login-pin" className="market-label">
              PIN de 4 dígitos <span className="text-[#e7492f]">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPinHelp((visible) => !visible)}
              className="text-xs font-bold text-[#0b6a4c] hover:text-[#e7492f]"
              aria-expanded={showPinHelp}
            >
              {showPinHelp ? "Fechar ajuda" : "O que é o PIN?"}
            </button>
          </div>
          <input
            id="login-pin"
            type="password"
            required
            maxLength={4}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••"
            value={formData.pin}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                pin: event.target.value.replace(/\D/g, "").slice(0, 4),
              }))
            }
            className="market-field mt-2 text-center text-xl font-black tracking-[0.45em]"
          />
          {showPinHelp && (
            <div className="mt-3 border-l-2 border-[#0b8a5f] bg-[#eef8f1] px-4 py-3 text-xs leading-5 text-[#52685f]">
              O PIN é enviado por SMS quando cria a conta. Se não o recebeu, confirme o número e solicite um novo envio.
            </div>
          )}
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={handleResendPin}
              disabled={isResending}
              className="text-xs font-bold text-[#0b6a4c] hover:text-[#e7492f] disabled:opacity-50"
            >
              {isResending ? "A reenviar..." : "Não recebeu? Reenviar PIN"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || authLoading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#e7492f] px-5 text-sm font-black text-white transition hover:bg-[#c83e27] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(isSubmitting || authLoading) && <Spinner />}
          {isSubmitting || authLoading
            ? pendingAd
              ? "A publicar anúncio..."
              : "A entrar..."
            : pendingAd
              ? "Publicar anúncio e entrar"
              : "Entrar"}
        </button>
      </form>

      <div className="mt-6 border-t border-[#edf4ef] pt-5 text-center text-sm text-[#52685f]">
        Ainda não tem conta?{" "}
        <Link href="/auth/register" className="font-black text-[#0b6a4c] hover:text-[#e7492f]">
          Criar conta
        </Link>
      </div>
      <Link
        href="/ads/create"
        className="mt-4 inline-flex w-full items-center justify-center text-sm font-bold text-[#6d8179] hover:text-[#0b3b2f]"
      >
        Continuar sem entrar
      </Link>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-[#f4fbf6]">
          <LoadingSpinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
