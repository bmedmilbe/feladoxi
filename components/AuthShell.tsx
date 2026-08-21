import type { ReactNode } from "react";
import Link from "next/link";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

const accountBenefits = [
  {
    title: "Anúncios num só lugar",
    description: "Publique, atualize e acompanhe a sua vitrine com clareza.",
  },
  {
    title: "Contacto direto",
    description: "Converse com compradores e vendedores pelo WhatsApp.",
  },
  {
    title: "Feito para São Tomé",
    description: "Distritos, preços em dobras e produtos da comunidade.",
  },
];

function MarketMark() {
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-[#bff5d4]">
      <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M24 37V11M24 11c-7 4-10 10-8 18 7-1 11-7 8-18Zm0 0c7 4 10 10 8 18-7-1-11-7-8-18Z"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 38c5-4 9-4 14 0 5-4 9-4 14 0M13 31c4-2 8-2 11 1 3-3 7-3 11-1"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <div className="bg-[#f4fbf6] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto grid min-h-[640px] max-w-[1180px] overflow-hidden rounded-lg border border-[#d8e7dc] bg-white shadow-[0_24px_60px_rgba(14,42,35,0.1)] lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="order-2 flex flex-col justify-between bg-[#0b2f27] p-6 text-white sm:p-8 lg:order-1 lg:p-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Voltar ao Mercado STP">
              <MarketMark />
              <span className="font-serif text-2xl font-semibold">Mercado STP</span>
            </Link>

            <p className="mt-10 text-xs font-black uppercase tracking-[0.18em] text-[#ffb199]">
              Conta Mercado STP
            </p>
            <h2 className="mt-3 max-w-md font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              O mercado local também cabe no seu telemóvel.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#dff6ea]">
              Entre com o seu número e mantenha compras, anúncios e contactos organizados.
            </p>
          </div>

          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {accountBenefits.map((benefit, index) => (
              <div key={benefit.title} className="flex gap-4 py-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/10 text-xs font-black text-[#ffb199]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-black">{benefit.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#cce8da]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="order-1 flex items-center px-5 py-8 sm:px-10 lg:order-2 lg:px-14 lg:py-12">
          <div className="mx-auto w-full max-w-[500px]">
            <p className="market-kicker">{eyebrow}</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#07382d] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#52685f]">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
