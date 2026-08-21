import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre nós | Mercado STP",
  description: "Conheça o propósito do Mercado STP e os nossos contactos oficiais.",
};

const whatsappMessage = encodeURIComponent(
  "Olá, estou a contactar através do site Mercado STP.",
);

const contactNumbers = [
  {
    region: "São Tomé e Príncipe",
    number: "+239 9940219",
    href: `https://wa.me/2399940219?text=${whatsappMessage}`,
  },
  {
    region: "Reino Unido / Internacional",
    number: "+44 7417 444458",
    href: `https://wa.me/447417444458?text=${whatsappMessage}`,
  },
];

const principles = [
  {
    number: "01",
    title: "Valorizar o mercado local",
    description: "Dar visibilidade a produtos, negócios e oportunidades de São Tomé e Príncipe.",
  },
  {
    number: "02",
    title: "Aproximar pessoas",
    description: "Facilitar o contacto direto entre quem procura um produto e quem o tem para vender.",
  },
  {
    number: "03",
    title: "Simplificar a venda",
    description: "Permitir que qualquer pessoa crie uma vitrine clara e alcance novos compradores.",
  },
];

function ArrowIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.2 7.7c.3-.6.7-.6 1-.6h.4l.8 2c.1.3 0 .5-.2.7l-.6.7c-.2.2-.1.5 0 .7.7 1.2 1.7 2.1 3 2.7.3.1.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.4.4.6 0 .6-.3 1.5-1 1.9-.6.4-1.4.6-2.3.3-1.1-.3-2.5-.8-4.1-2.2-1.3-1.1-2.2-2.5-2.5-3.6-.3-1.1 0-2.1.4-2.7.2-.1.4-.1.6-.1Z" fill="currentColor" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-[#f6fafb]">
      <section className="bg-white">
        <div className="mx-auto max-w-[1536px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative min-h-[330px] overflow-hidden rounded-lg bg-[#075f8f] text-white sm:min-h-[380px]">
            <div
              className="absolute inset-0 bg-cover bg-[65%_center] sm:bg-[70%_center]"
              style={{ backgroundImage: "url(/images/mercado-hero.png)" }}
              role="img"
              aria-label="Produtos locais, tecnologia e cultura de São Tomé e Príncipe"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,54,91,0.98)_0%,rgba(4,83,126,0.92)_48%,rgba(3,106,135,0.28)_100%)]" />

            <div className="relative flex min-h-[330px] max-w-2xl flex-col justify-center px-6 py-9 sm:min-h-[380px] sm:px-12 lg:px-16">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffe071]">A nossa história</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
                Sobre o Mercado STP
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#e8f7ff] sm:text-lg">
                Uma vitrine digital criada para aproximar compradores, vendedores e pequenos negócios de São Tomé e Príncipe.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href="#contactos" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#ffd23f] px-5 text-sm font-black text-[#082f4f] transition hover:bg-[#ffe071]">
                  Falar connosco <ArrowIcon />
                </a>
                <Link href="/#produtos" className="inline-flex h-12 items-center justify-center rounded-md border border-white/50 bg-[#075683]/70 px-5 text-sm font-black text-white transition hover:bg-[#06486f]">
                  Explorar produtos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="market-kicker">O nosso propósito</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#082f4f] sm:text-4xl">
                Fazer o mercado local chegar mais longe
              </h2>
              <p className="mt-4 text-base leading-7 text-[#516f82]">
                O Mercado STP nasceu para tornar mais simples descobrir produtos, divulgar negócios e criar novas oportunidades. A plataforma organiza os anúncios numa vitrine acessível e deixa a negociação nas mãos de compradores e fornecedores.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {principles.map((principle) => (
                <article key={principle.number} className="rounded-lg border border-[#d6e8ed] bg-white p-5 shadow-[0_12px_28px_rgba(7,52,79,0.06)]">
                  <span className="text-xs font-black text-[#078b8d]">{principle.number}</span>
                  <h3 className="mt-4 text-lg font-extrabold leading-6 text-[#082f4f]">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#657d8d]">{principle.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#cfe3ea] bg-white">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-3 lg:px-8">
            {[
              ["Descubra", "Pesquise produtos e navegue pelas categorias disponíveis."],
              ["Converse", "Use o WhatsApp para esclarecer dúvidas diretamente."],
              ["Negocie", "Combine os detalhes do negócio com clareza e segurança."],
            ].map(([title, description], index) => (
              <div key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#082f4f] text-sm font-black text-white">{index + 1}</span>
                <div>
                  <h2 className="text-lg font-extrabold text-[#082f4f]">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-[#657d8d]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contactos" className="scroll-mt-36 bg-[#eaf7f9]">
          <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <div>
                <p className="market-kicker">Contactos oficiais</p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#082f4f] sm:text-4xl">Fale com o Mercado STP</h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-[#516f82]">
                  Para dúvidas sobre a plataforma, sugestões ou apoio, escolha o contacto mais conveniente e envie uma mensagem pelo WhatsApp.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {contactNumbers.map((contact) => (
                  <a
                    key={contact.number}
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-[132px] items-center gap-4 rounded-lg border border-[#b8dce4] bg-white p-5 shadow-[0_12px_28px_rgba(7,52,79,0.06)] transition hover:border-[#138256] hover:shadow-[0_16px_34px_rgba(7,52,79,0.10)]"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#138256] text-white">
                      <WhatsAppIcon />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-[#657d8d]">{contact.region}</span>
                      <strong className="mt-1 block text-lg font-extrabold text-[#082f4f]">{contact.number}</strong>
                      <span className="mt-2 inline-flex items-center gap-2 text-xs font-black text-[#138256]">Abrir WhatsApp <ArrowIcon /></span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
