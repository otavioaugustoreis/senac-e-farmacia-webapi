import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ExternalLink, Ticket } from "lucide-react";
import { detalharMedicamento, type DetalheMedicamento } from "@/application/casos-de-uso/detalhar-medicamento";
import { BULARIO_ANVISA_URL } from "@/domain/bula";
import { NaoEncontradoError } from "@/domain/erros";
import { obterContainer } from "@/infrastructure/container";
import { CartaoMedicamento } from "@/components/CartaoMedicamento";
import { ReportarPreco } from "@/components/ReportarPreco";
import { CaixaMedicamento, SeloTipo } from "@/components/visual";
import { formatBRL, formatData } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

async function carregar(idTexto: string): Promise<{ detalhe: DetalheMedicamento; logado: boolean }> {
  const id = Number(idTexto);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const { repos, usuarioAtual } = await obterContainer();
  try {
    const [detalhe, usuario] = await Promise.all([detalharMedicamento(repos)(id, new Date()), usuarioAtual()]);
    return { detalhe, logado: usuario !== null };
  } catch (e) {
    if (e instanceof NaoEncontradoError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { repos } = await obterContainer();
  const m = Number.isInteger(Number(id)) ? await repos.medicamentos.obterPorId(Number(id)) : null;
  return { title: m ? `${m.nomeComercial} — preços e bula | E-Farmácia` : "Medicamento — E-Farmácia" };
}

export default async function MedicamentoPage({ params }: Props) {
  const { id } = await params;
  const { detalhe: d, logado } = await carregar(id);
  const m = d.medicamento;
  const caminho = `/medicamento/${m.id}`;

  const secoes = [
    ["Para que serve", d.bula?.paraQueServe],
    ["Como usar", d.comoUsar],
    ["Contraindicações", d.bula?.contraindicacoes],
    ["Efeitos colaterais", d.bula?.efeitosColaterais],
    ["Advertências", d.bula?.advertencias],
  ] as const;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-suave">
        <Link href="/busca" className="underline">Medicamentos</Link>
        {m.categoria && <> / <Link href={`/busca?categoria=${m.categoria.id}`} className="underline">{m.categoria.nome}</Link></>}
      </nav>

      <section className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="hidden md:block">
          <CaixaMedicamento categoria={m.categoria?.nome} nome={m.nomeComercial} grande />
        </div>
        <div>
          <SeloTipo tipo={m.tipo} />
          <h1 className="mt-2 text-2xl font-bold leading-tight text-marca-900 sm:text-3xl">{m.nomeComercial}</h1>
          <p className="mt-1 text-suave">
            <span className="font-medium text-tinta">{m.principioAtivo}</span> · {m.apresentacao} · {m.fabricante}
          </p>
          <div className="mt-4 rounded-2xl bg-menta-50 p-4 ring-1 ring-marca-600/10">
            {d.menorPreco ? (
              <>
                <p className="text-sm text-suave">Menor preço encontrado</p>
                <p className="text-3xl font-bold text-marca-700">{formatBRL(d.menorPreco.valor)}</p>
                <p className="text-sm text-suave">em {d.menorPreco.farmacia.nome} · atualizado em {formatData(d.menorPreco.atualizadoEm)}</p>
              </>
            ) : (
              <p className="font-medium">Sem preços cadastrados para este medicamento.</p>
            )}
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-suave">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-alerta" aria-hidden />
            O E-Farmácia informa, não substitui a orientação de médico ou farmacêutico.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Preços */}
          <section aria-labelledby="titulo-precos">
            <div className="flex items-baseline justify-between gap-2">
              <h2 id="titulo-precos" className="text-xl font-bold text-marca-900">Preços por farmácia</h2>
              <span className="rounded-full bg-creme px-2 py-0.5 text-[11px] font-semibold text-amber-800">Dados de demonstração</span>
            </div>
            {d.precos.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-white p-6 text-center text-suave ring-1 ring-black/5">Sem preços cadastrados.</p>
            ) : (
              <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
                {d.precos.map((p, i) => (
                  <li key={p.id} className={`p-4 ${i === 0 ? "bg-menta-50" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug">{p.farmacia.nome}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-suave">
                          {i === 0 && <span className="rounded-full bg-marca-800 px-2 py-0.5 text-[11px] font-semibold text-white">Menor preço</span>}
                          <span>Atualizado em {formatData(p.atualizadoEm)}</span>
                          {p.desatualizado && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">Desatualizado</span>}
                        </p>
                      </div>
                      <p className="shrink-0 whitespace-nowrap text-xl font-bold text-marca-700">{formatBRL(p.valor)}</p>
                    </div>
                    <div className="mt-1"><ReportarPreco precoId={p.id} logado={logado} voltarPara={caminho} /></div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/farmacias" className="mt-2 inline-block text-sm font-semibold text-marca-700 underline">Ver farmácias no mapa</Link>
          </section>

          {/* Bula */}
          <section aria-labelledby="titulo-bula">
            <h2 id="titulo-bula" className="text-xl font-bold text-marca-900">Bula organizada</h2>
            <div className="mt-3 space-y-2">
              {secoes.map(([titulo, texto], i) => (
                <details key={titulo} open={i < 2} className="group rounded-2xl bg-white p-4 ring-1 ring-black/5">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">
                    <span className="mr-2 inline-block text-marca-600 transition group-open:rotate-90">›</span>{titulo}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-tinta/90">{texto || "Consulte a bula oficial."}</p>
                </details>
              ))}
            </div>
            <a href={d.bula?.linkAnvisa || BULARIO_ANVISA_URL} target="_blank" rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-marca-700 underline">
              Bula completa no Bulário Eletrônico da Anvisa <ExternalLink className="size-4" aria-hidden />
            </a>
          </section>
        </div>

        <aside className="space-y-8">
          {/* Cupons */}
          {d.cupons.length > 0 && (
            <section aria-labelledby="titulo-cupons" className="rounded-2xl bg-creme p-5">
              <h2 id="titulo-cupons" className="flex items-center gap-2 font-bold text-marca-900"><Ticket className="size-5" aria-hidden /> Cupons das farmácias</h2>
              <ul className="mt-3 space-y-2">
                {d.cupons.map((c) => (
                  <li key={c.id} className="rounded-xl bg-white p-3 text-sm">
                    <p className="font-semibold">{c.farmacia.nome}: <span className="font-mono text-marca-700">{c.codigo}</span></p>
                    <p className="text-xs text-suave">{c.descricao} · até {formatData(c.validade)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Alternativas */}
          <section aria-labelledby="titulo-alternativas">
            <h2 id="titulo-alternativas" className="text-xl font-bold text-marca-900">Alternativas</h2>
            <p className="text-sm text-suave">Mesmo princípio ativo ({m.principioAtivo})</p>
            {d.alternativas.length === 0 ? (
              <p className="mt-3 text-sm text-suave">Nenhuma alternativa cadastrada.</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-1">
                {d.alternativas.map((a) => <CartaoMedicamento key={a.id} medicamento={a} />)}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
