"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/AuthShell";
import { PhoneField } from "@/components/PhoneField";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { DistrictLabels, type District } from "@/types";

function CheckIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  const { language, tr } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingAd, setHasPendingAd] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [formData, setFormData] = useState<{
    country_code: string;
    mobile_number: string;
    district: District | "";
  }>({
    country_code: "+239",
    mobile_number: "",
    district: "",
  });

  useEffect(() => {
    setHasPendingAd(Boolean(localStorage.getItem("pending_ad_token")));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.mobile_number.trim().length < 6) {
      toast.error(tr("Indique um número de telefone válido", "Enter a valid phone number"));
      return;
    }
    if (!formData.district) {
      toast.error(tr("Selecione o seu distrito", "Select your district"));
      return;
    }

    setIsSubmitting(true);
    try {
      await register(
        `${formData.country_code}${formData.mobile_number}`,
        formData.district,
      );
      setRegistrationComplete(true);
    } catch {
      // O contexto apresenta a mensagem devolvida pela API.
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullNumber = `${formData.country_code} ${formData.mobile_number}`;

  return (
    <AuthShell
      eyebrow={registrationComplete ? tr("Conta preparada", "Account ready") : tr("Primeiro acesso", "First access")}
      title={registrationComplete ? tr("Verifique o telefone", "Check your phone") : tr("Criar conta", "Create account")}
      description={
        registrationComplete
          ? tr("Enviámos um PIN de 4 dígitos por SMS. Use-o para entrar na sua conta.", "We sent a 4-digit PIN by SMS. Use it to sign in to your account.")
          : hasPendingAd
            ? tr("Crie a conta para publicar o anúncio que ficou guardado.", "Create an account to publish your saved listing.")
            : tr("Basta um número de telefone e o seu distrito para começar.", "All you need is a phone number and your district to get started.")
      }
    >
      {registrationComplete ? (
        <div>
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#e7f5ee] text-[#0b8a5f]">
            <CheckIcon />
          </div>
          <h2 className="mt-5 text-xl font-black text-[#0b2f27]">{tr("Conta criada com sucesso", "Account created successfully")}</h2>
          <p className="mt-2 text-sm leading-6 text-[#52685f]">
            {tr("O código foi enviado para", "The code was sent to")} <strong className="text-[#0b2f27]">{fullNumber}</strong>.
          </p>
          <div className="mt-5 border-l-4 border-[#0b8a5f] bg-[#eef8f1] px-4 py-3 text-sm leading-6 text-[#426057]">
            {hasPendingAd
              ? tr("Depois de entrar, o rascunho será publicado automaticamente na sua conta.", "After you sign in, the draft will be published automatically to your account.")
              : tr("Guarde o PIN. Vai precisar dele sempre que entrar no Mercado STP.", "Keep your PIN. You will need it whenever you sign in to Mercado STP.")}
          </div>
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-[#e7492f] px-5 text-sm font-black text-white transition hover:bg-[#c83e27]"
          >
            {tr("Continuar para entrar", "Continue to sign in")}
          </button>
        </div>
      ) : (
        <>
          {hasPendingAd && (
            <div className="mb-6 border-l-4 border-[#e7492f] bg-[#fff5ef] px-4 py-3">
              <p className="text-sm font-black text-[#0b2f27]">{tr("O seu rascunho está protegido", "Your draft is protected")}</p>
              <p className="mt-1 text-xs leading-5 text-[#6d594f]">
                {tr("A publicação será concluída depois do primeiro acesso.", "The listing will be published after your first sign-in.")}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <PhoneField
              idPrefix="register"
              countryCode={formData.country_code}
              mobileNumber={formData.mobile_number}
              onCountryCodeChange={(value) =>
                setFormData((current) => ({ ...current, country_code: value }))
              }
              onMobileNumberChange={(value) =>
                setFormData((current) => ({ ...current, mobile_number: value }))
              }
            />

            <div className="border-l-2 border-[#0b8a5f] bg-[#eef8f1] px-4 py-3 text-xs leading-5 text-[#52685f]">
              {tr("O PIN de 4 dígitos será enviado por SMS para este número.", "The 4-digit PIN will be sent to this number by SMS.")}
            </div>

            <div>
              <label htmlFor="register-district" className="market-label">
                {tr("Distrito", "District")} <span className="text-[#e7492f]">*</span>
              </label>
              <select
                id="register-district"
                required
                value={formData.district}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    district: event.target.value as District | "",
                  }))
                }
                className="market-field mt-2"
              >
                <option value="">{tr("Selecione o seu distrito", "Select your district")}</option>
                {Object.entries(DistrictLabels).filter(([key]) => key !== "UNKNOWN").map(([key, label]) => (
                  <option key={key} value={key}>
                    {language === "en" && key === "DIASPORA" ? "Diaspora" : label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#e7492f] px-5 text-sm font-black text-white transition hover:bg-[#c83e27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {(isSubmitting || authLoading) && <Spinner />}
              {isSubmitting || authLoading
                ? tr("A enviar PIN...", "Sending PIN...")
                : hasPendingAd
                  ? tr("Criar conta e continuar", "Create account and continue")
                  : tr("Criar conta", "Create account")}
            </button>
          </form>

          <div className="mt-6 border-t border-[#edf4ef] pt-5 text-center text-sm text-[#52685f]">
            {tr("Já tem uma conta?", "Already have an account?")}{" "}
            <Link href="/auth/login" className="font-black text-[#0b6a4c] hover:text-[#e7492f]">
              {tr("Entrar", "Sign in")}
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
