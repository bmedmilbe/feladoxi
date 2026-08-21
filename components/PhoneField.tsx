"use client";

import { useLanguage } from "@/context/LanguageContext";

interface PhoneFieldProps {
  countryCode: string;
  mobileNumber: string;
  onCountryCodeChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
  idPrefix: string;
}

const countryCodes = [
  { code: "+239", label: "ST +239" },
  { code: "+351", label: "PT +351" },
  { code: "+244", label: "AO +244" },
  { code: "+238", label: "CV +238" },
  { code: "+245", label: "GW +245" },
  { code: "+258", label: "MZ +258" },
  { code: "+55", label: "BR +55" },
  { code: "+33", label: "FR +33" },
  { code: "+34", label: "ES +34" },
  { code: "+44", label: "GB +44" },
  { code: "+49", label: "DE +49" },
  { code: "+39", label: "IT +39" },
  { code: "+31", label: "NL +31" },
  { code: "+32", label: "BE +32" },
  { code: "+41", label: "CH +41" },
  { code: "+1", label: "US/CA +1" },
  { code: "+27", label: "ZA +27" },
  { code: "+234", label: "NG +234" },
  { code: "+254", label: "KE +254" },
  { code: "+250", label: "RW +250" },
  { code: "+256", label: "UG +256" },
  { code: "+86", label: "CN +86" },
  { code: "+81", label: "JP +81" },
  { code: "+91", label: "IN +91" },
];

export function PhoneField({
  countryCode,
  mobileNumber,
  onCountryCodeChange,
  onMobileNumberChange,
  idPrefix,
}: PhoneFieldProps) {
  const { tr } = useLanguage();
  return (
    <div>
      <label htmlFor={`${idPrefix}-mobile-number`} className="market-label">
        {tr("Número de telefone", "Phone number")} <span className="text-[#e7492f]">*</span>
      </label>
      <div className="mt-2 grid grid-cols-[132px_minmax(0,1fr)] gap-2 sm:grid-cols-[145px_minmax(0,1fr)]">
        <label className="sr-only" htmlFor={`${idPrefix}-country-code`}>
          {tr("Indicativo do país", "Country calling code")}
        </label>
        <select
          id={`${idPrefix}-country-code`}
          value={countryCode}
          onChange={(event) => onCountryCodeChange(event.target.value)}
          className="market-field px-3"
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label}
            </option>
          ))}
        </select>
        <input
          id={`${idPrefix}-mobile-number`}
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="99040219"
          value={mobileNumber}
          onChange={(event) => onMobileNumberChange(event.target.value.replace(/\D/g, ""))}
          className="market-field"
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-[#6d8179]">
        {tr("Escolha o indicativo e escreva o número sem zeros à frente.", "Choose the calling code and enter the number without leading zeros.")}
      </p>
    </div>
  );
}
