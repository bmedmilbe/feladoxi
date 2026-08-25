import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const sellerSteps = [
  {
    title: "Fotografe",
    titleEn: "Photograph",
    description: "Apresente o produto com imagens nítidas e detalhes importantes.",
    descriptionEn: "Show the product with clear images and important details.",
    icon: "camera",
  },
  {
    title: "Publique",
    titleEn: "Publish",
    description: "Adicione nome, categoria, preço e o seu contacto.",
    descriptionEn: "Add a name, category, price and your contact details.",
    icon: "publish",
  },
  {
    title: "Converse",
    titleEn: "Chat",
    description: "Receba interessados e negocie diretamente pelo WhatsApp.",
    descriptionEn: "Receive enquiries and negotiate directly through WhatsApp.",
    icon: "chat",
  },
];

function ArrowIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepIcon({ name }: { name: string }) {
  if (name === "camera") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h4l1.5-2h5L16 7h4v12H4V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "publish") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v6h14v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 11.5a7.5 7.5 0 0 1-11.2 6.6L4 19.5l1.4-4.4A7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function SellerInvite() {
  const { tr } = useLanguage();
  return (
    <section id="vender" className="relative left-1/2 right-1/2 mt-14 w-screen -translate-x-1/2 border-y border-[#cfe3ea] bg-[#eef8fa]">
      <div className="mx-auto grid max-w-[1536px] gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 lg:px-8 lg:py-14">
        <div className="max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#078b8d]">
            {tr("Vender no Mercado STP", "Sell on Mercado STP")}
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[#082f4f] sm:text-4xl">
            {tr("Transforme o que tem numa nova oportunidade.", "Turn what you have into a new opportunity.")}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#516f82] sm:text-base">
            {tr("Crie o anúncio, mostre o produto e fale diretamente com compradores interessados em São Tomé e Príncipe.", "Create a listing, show your product and speak directly with interested buyers in São Tomé and Príncipe.")}
          </p>

          <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#f1cf4b] bg-[#fff7d6] px-3 py-2 text-sm font-black text-[#725800]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#ffd23f] text-xs" aria-hidden="true">✓</span>
            {tr("Anunciar produtos é grátis", "Listing products is free")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/ads/create" className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-[#ffd23f] px-6 text-sm font-black text-[#082f4f] shadow-[0_10px_22px_rgba(7,52,79,0.10)] transition hover:bg-[#ffe071]">
              {tr("Anunciar produto", "List a product")}
              <ArrowIcon />
            </Link>
            <Link href="/my-ads" className="inline-flex h-12 items-center justify-center rounded-md border border-[#9fc6d3] bg-white px-6 text-sm font-black text-[#082f4f] transition hover:border-[#08a6a6] hover:bg-[#e4f7f7]">
              {tr("Os meus anúncios", "My listings")}
            </Link>
          </div>
        </div>

        <ol className="grid gap-3 md:grid-cols-3">
          {sellerSteps.map((step, index) => (
            <li key={step.title} className="min-h-[190px] rounded-lg border border-[#d6e8ed] bg-white p-5 shadow-[0_12px_28px_rgba(7,52,79,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-[#e4f7f7] text-[#078b8d]">
                  <StepIcon name={step.icon} />
                </span>
                <span className="text-xs font-black text-[#8aa2b0]">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-black text-[#082f4f]">{tr(step.title, step.titleEn)}</h3>
              <p className="mt-2 text-sm leading-6 text-[#657d8d]">{tr(step.description, step.descriptionEn)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
