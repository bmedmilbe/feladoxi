import type { Metadata } from "next";
import Link from "next/link";
import { LocalizedText } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Ajuda | Mercado STP",
  description: "Ajuda para comprar, vender e gerir a sua conta no Mercado STP.",
};

const helpTopics = [
  {
    id: "comprar",
    title: "Comprar produtos",
    titleEn: "Buy products",
    description: "Encontre anúncios, aplique filtros e fale diretamente com o fornecedor.",
    descriptionEn: "Find listings, apply filters and speak directly with the supplier.",
    action: "Ver produtos",
    actionEn: "View products",
    href: "/#produtos",
    icon: "bag",
    steps: [
      "Pesquise pelo nome do produto ou escolha uma categoria.",
      "Abra o anúncio para consultar fotografias, preço, condição e distrito.",
      "Use o botão do WhatsApp para confirmar disponibilidade com o fornecedor.",
    ],
    stepsEn: [
      "Search by product name or choose a category.",
      "Open the listing to view photos, price, condition and district.",
      "Use the WhatsApp button to confirm availability with the supplier.",
    ],
  },
  {
    id: "vender",
    title: "Publicar um anúncio",
    titleEn: "Publish a listing",
    description: "Apresente o seu produto e receba contactos de compradores interessados.",
    descriptionEn: "Showcase your product and receive enquiries from interested buyers.",
    action: "Anunciar produto",
    actionEn: "List a product",
    href: "/ads/create",
    icon: "plus",
    steps: [
      "Adicione o nome, a categoria, o preço e uma descrição clara.",
      "Utilize fotografias nítidas que mostrem o estado real do produto.",
      "Entre na conta para publicar e acompanhar o anúncio em Os meus anúncios.",
    ],
    stepsEn: [
      "Add the name, category, price and a clear description.",
      "Use sharp photos that show the product's true condition.",
      "Sign in to publish and manage the listing in My listings.",
    ],
  },
  {
    id: "conta",
    title: "Conta e acesso",
    titleEn: "Account and access",
    description: "Entre com o seu telefone e mantenha os anúncios organizados.",
    descriptionEn: "Sign in with your phone and keep your listings organised.",
    action: "Entrar na conta",
    actionEn: "Sign in",
    href: "/auth/login",
    icon: "user",
    steps: [
      "Informe o indicativo e o seu número de telefone.",
      "Introduza o PIN recebido para confirmar o acesso.",
      "Nunca partilhe o PIN da sua conta com compradores ou fornecedores.",
    ],
    stepsEn: [
      "Enter the country code and your phone number.",
      "Enter the PIN you received to confirm access.",
      "Never share your account PIN with buyers or suppliers.",
    ],
  },
  {
    id: "seguranca",
    title: "Comprar com segurança",
    titleEn: "Buy safely",
    description: "Confirme os detalhes do anúncio antes de concluir qualquer negócio.",
    descriptionEn: "Confirm the listing details before completing any transaction.",
    action: "Explorar anúncios",
    actionEn: "Explore listings",
    href: "/#produtos",
    icon: "shield",
    steps: [
      "Peça informações adicionais quando a descrição ou as fotografias não forem suficientes.",
      "Confirme a identidade, o produto, o preço e o local combinado.",
      "Não envie PINs, palavras-passe ou outros dados privados pelo WhatsApp.",
    ],
    stepsEn: [
      "Ask for more information when the description or photos are not enough.",
      "Confirm the person's identity, the product, price and agreed meeting place.",
      "Do not send PINs, passwords or other private information through WhatsApp.",
    ],
  },
];

const frequentlyAskedQuestions = [
  {
    question: "Como encontro um produto específico?",
    questionEn: "How do I find a specific product?",
    answer: "Use a pesquisa no topo da página e escreva o nome, a marca ou a categoria. Também pode abrir os filtros para escolher categoria, distrito e condição.",
    answerEn: "Use the search bar at the top of the page and enter the name, brand or category. You can also use filters to choose a category, district and condition.",
  },
  {
    question: "Como contacto o fornecedor?",
    questionEn: "How do I contact the supplier?",
    answer: "Abra o anúncio ou toque no ícone verde do WhatsApp no cartão do produto. Será encaminhado para uma conversa direta com o fornecedor.",
    answerEn: "Open the listing or tap the green WhatsApp icon on the product card. You will be taken to a direct conversation with the supplier.",
  },
  {
    question: "Preciso de conta para consultar produtos?",
    questionEn: "Do I need an account to browse products?",
    answer: "Não. Pode pesquisar, abrir anúncios e contactar fornecedores sem iniciar sessão. A conta é necessária para publicar e gerir os seus anúncios.",
    answerEn: "No. You can search, open listings and contact suppliers without signing in. An account is required to publish and manage your listings.",
  },
  {
    question: "Como altero ou removo um anúncio?",
    questionEn: "How do I edit or remove a listing?",
    answer: "Entre na conta e abra Os meus anúncios. Escolha o anúncio pretendido para atualizar as informações ou removê-lo da vitrine.",
    answerEn: "Sign in and open My listings. Choose the listing you want to update or remove from the marketplace.",
  },
  {
    question: "Por que os anúncios não estão a carregar?",
    questionEn: "Why are the listings not loading?",
    answer: "Confirme a ligação à internet, remova filtros ativos e tente novamente. A base online também pode estar em manutenção por alguns instantes.",
    answerEn: "Check your internet connection, remove active filters and try again. The online database may also be undergoing brief maintenance.",
  },
];

function TopicIcon({ name }: { name: string }) {
  if (name === "bag") {
    return <path d="M5 8h14l-1 12H6L5 8Zm4 0a3 3 0 0 1 6 0" />;
  }
  if (name === "plus") {
    return <path d="M12 5v14M5 12h14" />;
  }
  if (name === "user") {
    return <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />;
  }
  return <path d="M12 3 5 6v5c0 4.6 2.8 8.4 7 10 4.2-1.6 7-5.4 7-10V6l-7-3Zm-3 8 2 2 4-4" />;
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HelpPage() {
  return (
    <div className="bg-[#f6fafb]">
      <section className="border-b border-[#cfe3ea] bg-[#eaf7f9]">
        <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <p className="market-kicker"><LocalizedText pt="Apoio ao utilizador" en="User support" /></p>
          <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold leading-tight text-[#082f4f] sm:text-5xl">
                <LocalizedText pt="Como podemos ajudar?" en="How can we help?" />
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#516f82]">
                <LocalizedText pt="Encontre respostas rápidas para pesquisar produtos, contactar fornecedores, publicar anúncios e gerir a sua conta." en="Find quick answers about searching for products, contacting suppliers, publishing listings and managing your account." />
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/#produtos" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#ffd23f] px-5 text-sm font-black text-[#082f4f] transition hover:bg-[#ffe071]">
                <LocalizedText pt="Explorar produtos" en="Explore products" /> <ArrowIcon />
              </Link>
              <Link href="/ads/create" className="inline-flex h-12 items-center justify-center rounded-md border border-[#8bbbc9] bg-white px-5 text-sm font-black text-[#082f4f] transition hover:border-[#08a6a6] hover:bg-[#e4f7f7]">
                <LocalizedText pt="Criar anúncio" en="Create listing" />
              </Link>
            </div>
          </div>

          <nav className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Assuntos de ajuda">
            {helpTopics.map((topic) => (
              <a key={topic.id} href={`#${topic.id}`} className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#c7e0e7] bg-white px-3 text-center text-xs font-black text-[#126078] transition hover:border-[#08a6a6] hover:text-[#078b8d] sm:text-sm">
                <LocalizedText pt={topic.title} en={topic.titleEn} />
              </a>
            ))}
          </nav>
        </div>
      </section>

      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section aria-labelledby="help-topics-title">
          <p className="market-kicker"><LocalizedText pt="Guias rápidos" en="Quick guides" /></p>
          <h2 id="help-topics-title" className="mt-2 text-3xl font-extrabold text-[#082f4f]">
            <LocalizedText pt="Escolha o que precisa de fazer" en="Choose what you need to do" />
          </h2>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {helpTopics.map((topic) => (
              <article id={topic.id} key={topic.id} className="scroll-mt-36 rounded-lg border border-[#d6e8ed] bg-white p-5 shadow-[0_12px_28px_rgba(7,52,79,0.06)] sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#e4f7f7] text-[#078b8d]">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <TopicIcon name={topic.icon} />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-[#082f4f]"><LocalizedText pt={topic.title} en={topic.titleEn} /></h3>
                    <p className="mt-1 text-sm leading-6 text-[#657d8d]"><LocalizedText pt={topic.description} en={topic.descriptionEn} /></p>
                  </div>
                </div>

                <ol className="mt-5 grid gap-3 border-t border-[#e5eff3] pt-5">
                  {topic.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6 text-[#36586e]">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#082f4f] text-xs font-black text-white">{index + 1}</span>
                      <span><LocalizedText pt={step} en={topic.stepsEn[index]} /></span>
                    </li>
                  ))}
                </ol>

                <Link href={topic.href} className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-[#eefafa] px-4 text-sm font-black text-[#078b8d] transition hover:bg-[#dff5f5]">
                  <LocalizedText pt={topic.action} en={topic.actionEn} /> <ArrowIcon />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 border-t border-[#d6e8ed] pt-10" aria-labelledby="faq-title">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="market-kicker"><LocalizedText pt="Dúvidas comuns" en="Common questions" /></p>
              <h2 id="faq-title" className="mt-2 text-3xl font-extrabold text-[#082f4f]">
                <LocalizedText pt="Perguntas frequentes" en="Frequently asked questions" />
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#657d8d]">
                <LocalizedText pt="Respostas diretas para as situações mais comuns no Mercado STP." en="Straightforward answers to the most common situations on Mercado STP." />
              </p>
            </div>

            <div className="divide-y divide-[#dceaf0] border-y border-[#dceaf0]">
              {frequentlyAskedQuestions.map((item) => (
                <details key={item.question} className="group">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-extrabold text-[#082f4f] [&::-webkit-details-marker]:hidden">
                    <span><LocalizedText pt={item.question} en={item.questionEn} /></span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#e4f7f7] text-[#078b8d]">
                      <ChevronIcon />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-5 pr-12 text-sm leading-7 text-[#516f82]"><LocalizedText pt={item.answer} en={item.answerEn} /></p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 flex flex-col justify-between gap-5 rounded-lg border border-[#b8dce4] bg-[#eaf7f9] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#078b8d]"><LocalizedText pt="Ainda com dificuldades?" en="Still having trouble?" /></p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#082f4f]"><LocalizedText pt="Volte à vitrine e tente novamente" en="Return to the marketplace and try again" /></h2>
            <p className="mt-2 text-sm leading-6 text-[#516f82]"><LocalizedText pt="Remova os filtros ativos ou atualize a página para solicitar novamente os dados da base online." en="Remove active filters or refresh the page to request the online database again." /></p>
          </div>
          <Link href="/#produtos" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#082f4f] px-5 text-sm font-black text-white transition hover:bg-[#0b456e]">
            <LocalizedText pt="Ir para a vitrine" en="Go to marketplace" /> <ArrowIcon />
          </Link>
        </section>
      </main>
    </div>
  );
}
