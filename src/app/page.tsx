import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { montarVitrine } from "@/application/casos-de-uso/montar-vitrine";
import { obterContainer } from "@/infrastructure/container";
import { CartaoMedicamento } from "@/components/CartaoMedicamento";
import { visualDaCategoria } from "@/components/visual";
import { formatData } from "@/lib/format";

export default async function Home() {
  const { repos } = await obterContainer();
  const v = await montarVitrine(repos)(new Date());

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="grid gap-6 overflow-hidden rounded-[var(--radius-card)] bg-marca-900 p-6 text-white sm:p-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">Compare preços e consulte a bula num só lugar</h1>
          <p className="mt-4 max-w-lg text-white/80">
            Pesquise pelo nome comercial ou pelo princípio ativo, veja genéricos e similares mais baratos e encontre farmácias perto de você.
          </p>
          <form action="/busca" className="mt-6 flex max-w-lg items-center gap-2 rounded-full bg-white p-1.5 pl-4 text-tinta">
            <Search className="size-5 shrink-0 text-suave" aria-hidden />
            <input name="q" aria-label="Buscar medicamento" placeholder="Ex.: dipirona, losartana, Tylenol" className="w-full min-w-0 bg-transparent text-sm outline-none" />
            <button className="flex shrink-0 items-center gap-1 rounded-full bg-marca-800 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700">
              Buscar <ArrowRight className="size-4" aria-hidden />
            </button>
          </form>
        </div>
        <div className="grid place-items-center">
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <Numero valor={String(v.numeros.medicamentos)} rotulo="medicamentos" />
            <Numero valor={String(v.numeros.farmacias)} rotulo="farmácias" />
            <div className="col-span-2 rounded-2xl bg-white p-5 text-tinta">
              <p className="text-4xl font-bold text-marca-700">
                {v.numeros.economiaMediaPercentual !== null ? `${v.numeros.economiaMediaPercentual}%` : "—"}
              </p>
              <p className="text-sm text-suave">de economia média do genérico ou similar em relação ao de referência</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias" className="sr-only">Categorias</h2>
        <ul className="grid grid-cols-4 gap-4 sm:grid-cols-8">
          {v.categorias.map((c) => {
            const vis = visualDaCategoria(c.nome);
            const Icone = vis.icone;
            return (
              <li key={c.id}>
                <Link href={`/busca?categoria=${c.id}`} className="group flex flex-col items-center text-center">
                  <span className="grid size-16 place-items-center rounded-full transition group-hover:scale-105 sm:size-20" style={{ background: vis.fundo }}>
                    <Icone className="size-7" style={{ color: vis.tampa }} aria-hidden />
                  </span>
                  <span className="mt-2 text-xs font-semibold leading-tight sm:text-sm">{c.nome}</span>
                  <span className="font-serif text-xs italic text-suave sm:text-sm">{vis.subtitulo}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Menores preços */}
      <section aria-labelledby="titulo-precos">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="titulo-precos" className="text-2xl font-bold text-marca-900">Menores preços</h2>
            <p className="text-sm text-suave">Genéricos e similares comparados ao medicamento de referência</p>
          </div>
          <Link href="/busca" className="shrink-0 text-sm font-semibold text-marca-700 underline">Ver todos</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {v.menoresPrecos.map((m) => (
            <CartaoMedicamento key={m.id} medicamento={m} precoReferencia={m.precoReferencia} economiaPercentual={m.economiaPercentual} />
          ))}
        </div>
      </section>

      {/* Cupons */}
      {v.cupons.length > 0 && (
        <section className="grid gap-3 md:grid-cols-2" aria-label="Cupons em destaque">
          {v.cupons.map((c, i) => (
            <div key={c.id} className={`flex flex-col justify-between gap-4 rounded-[var(--radius-card)] p-6 ${i === 0 ? "bg-creme" : "bg-menta-100"}`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-suave">{c.farmacia.nome}</p>
                <p className="mt-1 text-2xl font-bold text-marca-900">{c.desconto} de desconto</p>
                <p className="text-sm text-suave">{c.descricao} · válido até {formatData(c.validade)}</p>
              </div>
              <Link href="/cupons" className="w-fit rounded-full bg-marca-800 px-4 py-2 text-sm font-semibold text-white">
                Usar cupom {c.codigo}
              </Link>
            </div>
          ))}
        </section>
      )}

      {/* Farmácias parceiras */}
      {v.farmaciasParceiras.length > 0 && (
        <section aria-labelledby="titulo-parceiras" className="text-center">
          <h2 id="titulo-parceiras" className="text-sm font-semibold text-suave">Farmácias parceiras</h2>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {v.farmaciasParceiras.map((f) => (
              <li key={f.id} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-marca-800 ring-1 ring-black/5">{f.nome}</li>
            ))}
          </ul>
          <Link href="/farmacias" className="mt-4 inline-block text-sm font-semibold text-marca-700 underline">Ver no mapa</Link>
        </section>
      )}
    </div>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <p className="text-3xl font-bold">{valor}</p>
      <p className="text-sm text-white/70">{rotulo}</p>
    </div>
  );
}
