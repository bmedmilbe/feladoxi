"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const placements = [
  { id: "vitrine", label: "Entre produtos da vitrine", labelEn: "Between marketplace products" },
  { id: "detalhe", label: "Página de produto", labelEn: "Product page" },
  { id: "rodape", label: "Antes do footer", labelEn: "Before the footer" },
];

const contacts = [
  { id: "stp", label: "São Tomé e Príncipe", labelEn: "São Tomé and Príncipe", number: "+239 9940219", digits: "2399940219" },
  { id: "international", label: "Reino Unido / Internacional", labelEn: "United Kingdom / International", number: "+44 7417 444458", digits: "447417444458" },
];

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 7.8c1 4.2 3.5 6.7 7.7 7.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AdvertisingRequestForm() {
  const { language, tr } = useLanguage();
  const [campaignType, setCampaignType] = useState<"Marca" | "Produto">("Marca");
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>(["vitrine"]);
  const [contactId, setContactId] = useState("stp");

  const togglePlacement = (placementId: string) => {
    setSelectedPlacements((current) =>
      current.includes(placementId)
        ? current.filter((id) => id !== placementId)
        : [...current, placementId],
    );
  };

  const submitRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedContact = contacts.find((contact) => contact.id === contactId) || contacts[0];
    const placementLabels = placements
      .filter((placement) => selectedPlacements.includes(placement.id))
      .map((placement) => language === "en" ? placement.labelEn : placement.label)
      .join(", ");

    const message = language === "en" ? [
      "Hello, I would like to advertise on Mercado STP.",
      "",
      `Type: ${campaignType === "Marca" ? "Brand" : "Product"}`,
      `Brand or product: ${form.get("campaign_name")}`,
      `Contact person: ${form.get("contact_name")}`,
      `Objective: ${form.get("objective")}`,
      `Preferred placement: ${placementLabels || "To be decided"}`,
      `Duration: ${form.get("duration")}`,
      `Preferred date: ${form.get("start_date") || "To be agreed"}`,
      `Link: ${form.get("target_url") || "Not provided"}`,
      `Description: ${form.get("description")}`,
    ].join("\n") : [
      "Olá, gostaria de anunciar no Mercado STP.", "", `Tipo: ${campaignType}`,
      `Marca ou produto: ${form.get("campaign_name")}`, `Responsável: ${form.get("contact_name")}`,
      `Objetivo: ${form.get("objective")}`, `Posição pretendida: ${placementLabels || "A definir"}`,
      `Duração: ${form.get("duration")}`, `Data pretendida: ${form.get("start_date") || "A combinar"}`,
      `Link: ${form.get("target_url") || "Não informado"}`, `Descrição: ${form.get("description")}`,
    ].join("\n");

    window.open(
      `https://wa.me/${selectedContact.digits}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <form onSubmit={submitRequest} className="rounded-lg border border-[#d6e8ed] bg-white p-5 shadow-[0_14px_34px_rgba(7,52,79,0.07)] sm:p-7">
      <fieldset>
        <legend className="market-label mb-3">{tr("O que pretende promover?", "What would you like to promote?")}</legend>
        <div className="grid grid-cols-2 rounded-md border border-[#c8dde5] bg-[#f4fafb] p-1">
          {(["Marca", "Produto"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCampaignType(type)}
              className={`h-11 rounded-md text-sm font-black transition ${
                campaignType === type
                  ? "bg-[#082f4f] text-white shadow-sm"
                  : "text-[#516f82] hover:text-[#078b8d]"
              }`}
              aria-pressed={campaignType === type}
            >
              {language === "en" ? (type === "Marca" ? "Brand" : "Product") : type}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="campaign-name" className="market-label mb-2">{tr("Nome da marca ou produto", "Brand or product name")}</label>
          <input id="campaign-name" name="campaign_name" required className="market-field" placeholder="Ex.: Loja Central" />
        </div>
        <div>
          <label htmlFor="contact-name" className="market-label mb-2">{tr("Pessoa responsável", "Contact person")}</label>
          <input id="contact-name" name="contact_name" required className="market-field" placeholder={tr("Nome do contacto", "Contact name")} />
        </div>
        <div>
          <label htmlFor="objective" className="market-label mb-2">{tr("Objetivo", "Objective")}</label>
          <select id="objective" name="objective" className="market-field" defaultValue={tr("Dar visibilidade à marca", "Increase brand awareness")}>
            <option>{tr("Dar visibilidade à marca", "Increase brand awareness")}</option>
            <option>{tr("Promover um produto", "Promote a product")}</option>
            <option>{tr("Divulgar uma promoção", "Advertise a promotion")}</option>
            <option>{tr("Apresentar um novo negócio", "Introduce a new business")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="duration" className="market-label mb-2">{tr("Duração pretendida", "Preferred duration")}</label>
          <select id="duration" name="duration" className="market-field" defaultValue={tr("2 semanas", "2 weeks")}>
            <option>{tr("1 semana", "1 week")}</option>
            <option>{tr("2 semanas", "2 weeks")}</option>
            <option>{tr("1 mês", "1 month")}</option>
            <option>{tr("Período personalizado", "Custom period")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="start-date" className="market-label mb-2">{tr("Data pretendida", "Preferred date")}</label>
          <input id="start-date" name="start_date" type="date" className="market-field" />
        </div>
        <div>
          <label htmlFor="target-url" className="market-label mb-2">{tr("Site ou rede social", "Website or social media")}</label>
          <input id="target-url" name="target_url" type="url" className="market-field" placeholder="https://" />
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="market-label mb-3">{tr("Onde gostaria de aparecer?", "Where would you like to appear?")}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {placements.map((placement) => {
            const checked = selectedPlacements.includes(placement.id);
            return (
              <label key={placement.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm font-bold transition ${checked ? "border-[#08a6a6] bg-[#e4f7f7] text-[#087f82]" : "border-[#c8dde5] bg-white text-[#516f82]"}`}>
                <input type="checkbox" checked={checked} onChange={() => togglePlacement(placement.id)} className="h-4 w-4 accent-[#08a6a6]" />
                <span>{language === "en" ? placement.labelEn : placement.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="campaign-description" className="market-label mb-2">{tr("Descrição da campanha", "Campaign description")}</label>
        <textarea id="campaign-description" name="description" required rows={4} className="w-full rounded-md border border-[#c8dde5] bg-white px-4 py-3 text-sm text-[#183e58] outline-none transition placeholder:text-[#8297a5] focus:border-[#08a6a6] focus:ring-4 focus:ring-[#08a6a6]/10" placeholder={tr("Apresente a campanha, o público e a mensagem principal.", "Describe the campaign, audience and main message.")} />
      </div>

      <fieldset className="mt-6">
        <legend className="market-label mb-3">{tr("Enviar pedido para", "Send request to")}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {contacts.map((contact) => (
            <label key={contact.id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition ${contactId === contact.id ? "border-[#138256] bg-[#edf9f3]" : "border-[#c8dde5] bg-white"}`}>
              <input type="radio" name="contact" value={contact.id} checked={contactId === contact.id} onChange={() => setContactId(contact.id)} className="h-4 w-4 accent-[#138256]" />
              <span>
                <strong className="block text-sm text-[#082f4f]">{language === "en" ? contact.labelEn : contact.label}</strong>
                <span className="mt-0.5 block text-xs text-[#657d8d]">{contact.number}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#138256] px-5 text-sm font-black text-white transition hover:bg-[#0f6c48] sm:w-auto">
        <WhatsAppIcon /> {tr("Enviar pedido pelo WhatsApp", "Send request via WhatsApp")}
      </button>
    </form>
  );
}
