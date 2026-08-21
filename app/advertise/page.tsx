import type { Metadata } from "next";
import { AdvertisingRequestForm } from "@/components/AdvertisingRequestForm";
import { LocalizedText } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Publicidade | Mercado STP",
  description: "Promova marcas e produtos através dos espaços publicitários do Mercado STP.",
};

const advertisingPositions = [
  {
    title: "Vitrine de produtos",
    titleEn: "Product showcase",
    description: "Uma faixa identificada como publicidade entre grupos de produtos.",
    descriptionEn: "A clearly labelled advertising banner between product groups.",
  },
  {
    title: "Página do produto",
    titleEn: "Product page",
    description: "Divulgação apresentada depois das informações principais do anúncio.",
    descriptionEn: "Promotion displayed after the listing's main information.",
  },
  {
    title: "Antes do footer",
    titleEn: "Before the footer",
    description: "Espaço de marca no encerramento das páginas do mercado.",
    descriptionEn: "Brand placement near the end of marketplace pages.",
  },
];

export default function AdvertisePage() {
  return (
    <div className="bg-[#f6fafb]">
      <section className="border-b border-[#cfe3ea] bg-[#eaf7f9]">
        <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="market-kicker"><LocalizedText pt="Publicidade no Mercado STP" en="Advertising on Mercado STP" /></p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-[#082f4f] sm:text-5xl">
            <LocalizedText pt="Dê mais visibilidade à sua marca ou produto" en="Give your brand or product more visibility" />
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#516f82]">
            <LocalizedText pt="Prepare um pedido de campanha para alcançar compradores interessados sem retirar o foco principal da vitrine." en="Prepare a campaign request to reach interested buyers without taking focus away from the marketplace." />
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:px-8">
        <section aria-labelledby="advertising-form-title">
          <p className="market-kicker"><LocalizedText pt="Pedido de campanha" en="Campaign request" /></p>
          <h2 id="advertising-form-title" className="mt-2 text-3xl font-extrabold text-[#082f4f]"><LocalizedText pt="Prepare o seu anúncio" en="Prepare your advert" /></h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657d8d]"><LocalizedText pt="Depois do envio, a equipa confirma o formato, as imagens, o período e as condições da publicação." en="After submission, the team will confirm the format, images, duration and publication terms." /></p>
          <div className="mt-6"><AdvertisingRequestForm /></div>
        </section>

        <aside className="lg:sticky lg:top-32">
          <p className="market-kicker"><LocalizedText pt="Posições disponíveis" en="Available placements" /></p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#082f4f]"><LocalizedText pt="Onde a publicidade pode aparecer" en="Where advertising can appear" /></h2>
          <div className="mt-5 divide-y divide-[#d6e8ed] border-y border-[#d6e8ed]">
            {advertisingPositions.map((position, index) => (
              <div key={position.title} className="flex gap-4 py-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#082f4f] text-xs font-black text-white">0{index + 1}</span>
                <div>
                  <h3 className="text-base font-extrabold text-[#082f4f]"><LocalizedText pt={position.title} en={position.titleEn} /></h3>
                  <p className="mt-1 text-sm leading-6 text-[#657d8d]"><LocalizedText pt={position.description} en={position.descriptionEn} /></p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-[#b8dce4] bg-[#eaf7f9] p-5">
            <strong className="text-sm font-extrabold text-[#082f4f]"><LocalizedText pt="Publicidade claramente identificada" en="Clearly labelled advertising" /></strong>
            <p className="mt-2 text-sm leading-6 text-[#516f82]"><LocalizedText pt="As campanhas são apresentadas com dimensões estáveis e sem pop-ups, reprodução automática ou sobreposição do menu." en="Campaigns use stable dimensions with no pop-ups, autoplay or menu overlays." /></p>
          </div>
        </aside>
      </main>
    </div>
  );
}
