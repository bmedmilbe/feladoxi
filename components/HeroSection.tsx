"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

function ArrowIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeroSection() {
  const { tr } = useLanguage();
  const moveToProducts = () => {
    document.getElementById("produtos")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1536px] px-4 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4 lg:px-8">
        <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-[#075f8f] text-white sm:min-h-[380px] lg:min-h-[400px]">
          <div
            className="absolute inset-0 bg-cover bg-[68%_center] sm:bg-[60%_center] lg:bg-[72%_center]"
            style={{ backgroundImage: "url(/images/mercado-hero.png)" }}
            role="img"
            aria-label={tr("Cacau, frutas e tecnologia de São Tomé e Príncipe", "Cocoa, fruit and technology from São Tomé and Príncipe")}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,73,117,0.98)_0%,rgba(4,91,142,0.94)_38%,rgba(4,112,152,0.48)_64%,rgba(3,157,158,0.10)_100%)] sm:bg-[linear-gradient(90deg,rgba(4,73,117,0.98)_0%,rgba(4,91,142,0.91)_37%,rgba(4,112,152,0.38)_62%,rgba(3,157,158,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,39,66,0.06),rgba(3,39,66,0.30))]" />

          <div className="relative flex min-h-[300px] max-w-[720px] flex-col justify-between px-5 py-6 sm:min-h-[380px] sm:px-12 sm:py-10 lg:min-h-[400px] lg:px-16">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffe071]">
                {tr("O mercado de São Tomé e Príncipe", "The marketplace of São Tomé and Príncipe")}
              </p>
              <h1 className="mt-3 max-w-[640px] text-3xl font-black leading-[1.08] text-white sm:mt-4 sm:text-5xl lg:text-[3.35rem]">
                {tr("Tudo o que precisa, mais perto de si.", "Everything you need, closer to you.")}
              </h1>
              <p className="mt-5 hidden max-w-[500px] text-base leading-7 text-[#e8f7ff] sm:block sm:text-lg">
                {tr("Descubra produtos locais e encontre tecnologia, moda e artigos para a sua casa, com contacto direto pelo WhatsApp.", "Discover local products, technology, fashion and homeware, with direct contact through WhatsApp.")}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
              <button type="button" onClick={moveToProducts} className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-[#ffd23f] px-7 text-sm font-black text-[#082f4f] shadow-[0_14px_28px_rgba(7,52,79,0.18)] transition hover:bg-[#ffe071] sm:h-14">
                {tr("Explorar produtos", "Explore products")}
                <ArrowIcon />
              </button>
              <Link href="/ads/create" className="hidden h-14 items-center justify-center rounded-md border border-white/70 bg-[#064c75]/90 px-7 text-sm font-black text-white shadow-[0_10px_24px_rgba(3,39,66,0.16)] backdrop-blur transition hover:bg-[#043f63] sm:inline-flex">
                {tr("Começar a vender", "Start selling")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
