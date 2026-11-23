import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarClock, MapPin } from "lucide-react";
import { buscarMedicamentos } from "@/application/casos-de-uso/buscar-medicamentos";
import { montarVitrine } from "@/application/casos-de-uso/montar-vitrine";
import { obterContainer } from "@/infrastructure/container";
import { CartaoMedicamento } from "@/components/CartaoMedicamento";
import { MaisBuscados } from "@/components/MaisBuscados";
import { visualDaCategoria } from "@/components/visual";
import { formatData } from "@/lib/format";

const ABAS_MAIS_BUSCADOS = ["Analgésicos e antitérmicos", "Anti-hipertensivos", "Antialérgicos", "Antibióticos"];

export default async function Home() {
  const { repos } = await obterContainer();
  const [v, todos] = await Promise.all([montarVitrine(repos)(new Date()), buscarMedicamentos(repos)("")]);

  const abas = ABAS_MAIS_BUSCADOS
    .map((nome) => ({
      rotulo: nome === "Analgésicos e antitérmicos" ? "Dor e febre" : nome,
      itens: todos.filter((m) => m.categoria?.nome === nome).slice(0, 4),
    }))
    .filter((a) => a.itens.length > 0);

  const maiorEconomia = Math.max(0, ...v.menoresPrecos.map((m) => m.economiaPercentual ?? 0));
  const [cupomDestaque] = v.cupons;

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero — continua o bloco verde do cabeçalho, como na referência */}
      <section className="-mt-10 grid gap-6 rounded-b-[var(--radius-card)] bg-marca-900 px-5 pb-5 pt-12 text-white sm:-mt-11 sm:px-8 sm:pb-8 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="flex flex-col justify-center lg:py-6">
          <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Compare preços e consulte a bula num só lugar
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">
            Encontre genéricos e similares mais baratos, leia a bula organizada e veja as farmácias perto de você.
          </p>
          <Link href="/busca" className="mt-6 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-marca-900 shadow-sm hover:bg-menta-100">
            Comparar preços <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="self-center overflow-hidden rounded-[1.75rem]">
          <Image src="/hero-efarmacia.svg" alt="Comparação de preço da dipirona: genérico 56% mais barato que o de referência, farmácias próximas e bula organizada"
            width={1224} height={720} priority unoptimized className="h-auto w-full" />
        </div>
      </section>

      {/* Categorias */}
      <section aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias" className="sr-only">Categorias</h2>
        <ul className="sem-barra -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-y-8 sm:overflow-visible sm:px-0 lg:grid-cols-8">
          {v.categorias.map((c) => {
            const vis = visualDaCategoria(c.nome);
            const Icone = vis.icone;
            return (
              <li key={c.id} className="w-[5.75rem] shrink-0 snap-start sm:w-auto">
                <Link href={`/busca?categoria=${c.id}`} className="group flex flex-col items-center text-center">
                  <span className="grid size-20 place-items-center rounded-full bg-[#eaf4ec] transition group-hover:scale-105 sm:size-24">
                    <span className="grid size-12 place-items-center rounded-2xl bg-white shadow-sm sm:size-14">
                      <Icone className="size-6 sm:size-7" style={{ color: vis.tampa }} aria-hidden />
                    </span>
                  </span>
                  <span className="mt-2.5 line-clamp-2 text-xs font-bold leading-tight text-tinta sm:text-sm">{c.nome}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Menores preços (como "Flash Sale") */}
      <section aria-labelledby="titulo-precos">
        <h2 id="titulo-precos" className="text-2xl font-bold text-marca-900 sm:text-3xl">Menores preços</h2>
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
          {v.menoresPrecos.map((m) => (
            <CartaoMedicamento key={m.id} medicamento={m} precoReferencia={m.precoReferencia} economiaPercentual={m.economiaPercentual} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/busca" className="inline-flex items-center gap-1 text-sm font-semibold text-marca-800 hover:underline">
            Ver todos os medicamentos <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Banners promocionais */}
      <section className="grid gap-4 md:grid-cols-2" aria-label="Destaques">
        <div className="relative flex min-h-[13rem] overflow-hidden rounded-[var(--radius-card)] bg-[#f4f1e6] p-6">
          <div className="relative z-10 flex max-w-[58%] flex-col justify-between gap-4">
            <div>
              <p className="text-2xl font-bold leading-tight text-tinta">Economize até {maiorEconomia}% com genéricos</p>
              <p className="mt-2 text-sm text-suave">Mesmo princípio ativo, preço bem menor. Compare antes de comprar.</p>
            </div>
            <Link href="/busca" className="w-fit rounded-full bg-marca-900 px-4 py-2 text-sm font-semibold text-white">Ver genéricos</Link>
          </div>
          <Image src="/genericos.svg" alt="Caixa de referência por R$ 42,90 ao lado do genérico por R$ 8,90: 79% de economia"
            width={600} height={450} unoptimized className="pointer-events-none absolute bottom-4 right-4 h-auto w-[38%] max-w-[11rem]" />
        </div>
        <div className="relative flex min-h-[13rem] overflow-hidden rounded-[var(--radius-card)] bg-[#e6f3ea] p-6">
          <div className="relative z-10 flex max-w-[58%] flex-col justify-between gap-4">
            <div>
              <p className="text-2xl font-bold leading-tight text-tinta">
                {cupomDestaque ? `${cupomDestaque.desconto} off na ${cupomDestaque.farmacia.nome}` : "Cupons de farmácias parceiras"}
              </p>
              <p className="mt-2 text-sm text-suave">
                {cupomDestaque ? `${cupomDestaque.descricao} · até ${formatData(cupomDestaque.validade)}` : "Descontos exclusivos para quem usa o E-Farmácia."}
              </p>
            </div>
            <Link href="/cupons" className="w-fit rounded-full bg-marca-900 px-4 py-2 text-sm font-semibold text-white">Ver cupons</Link>
          </div>
          <div className="absolute -right-6 bottom-6 rotate-[-8deg] rounded-2xl border-2 border-dashed border-marca-600/50 bg-white px-6 py-5 shadow-lg">
            <p className="font-mono text-lg font-bold text-marca-800">{cupomDestaque?.codigo ?? "CUPOM"}</p>
            <p className="text-xs text-suave">cupom de desconto</p>
          </div>
        </div>
      </section>

      {/* Farmácias parceiras (como "Trusted Brands") */}
      {v.farmaciasParceiras.length > 0 && (
        <section aria-labelledby="titulo-parceiras" className="text-center">
          <h2 id="titulo-parceiras" className="text-sm font-semibold text-tinta">Farmácias parceiras</h2>
          <ul className="sem-barra -mx-3 mt-4 flex gap-3 overflow-x-auto px-3 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            {v.farmaciasParceiras.map((f) => (
              <li key={f.id} className="shrink-0">
                <Link href="/farmacias" className="grid size-20 place-items-center rounded-full bg-[#fbf6ec] p-2 text-center text-[11px] font-bold leading-tight text-marca-800 ring-1 ring-black/5 hover:ring-marca-600 sm:size-24 sm:text-xs">
                  {f.nome.replace(/^(Farmácia|Drogaria)\s+/, "")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Mais buscados (como "Best Sellers") */}
      <MaisBuscados abas={abas} />

      {/* Bloco final (como "Trusted by…") */}
      <section className="rounded-[var(--radius-card)] bg-marca-900 px-6 py-10 text-center text-white sm:px-10 sm:py-14">
        <p className="text-alerta" aria-hidden>★★★★★</p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Feito para cuidar da sua saúde e do seu bolso</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/75">
          Informação confiável e preços comparados num só lugar, de graça para quem pesquisa.
        </p>
        <ul className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {[
            { icone: BadgeCheck, titulo: "Bula da fonte oficial", texto: "Resumos organizados com link para o Bulário da Anvisa." },
            { icone: CalendarClock, titulo: "Preço com data", texto: "Cada preço mostra quando foi atualizado." },
            { icone: MapPin, titulo: "Farmácias perto de você", texto: "Veja no mapa onde encontrar mais barato." },
          ].map(({ icone: Icone, titulo, texto }) => (
            <li key={titulo} className="rounded-2xl bg-white/10 p-5">
              <Icone className="size-6 text-alerta" aria-hidden />
              <p className="mt-3 font-semibold">{titulo}</p>
              <p className="mt-1 text-sm text-white/70">{texto}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
