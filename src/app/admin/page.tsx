import Link from "next/link";
import {
  AlertTriangle, ArrowRight, CalendarClock, Camera, CheckCircle2, ExternalLink, Flag, Pill, Plus, Store, Ticket, TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { montarPainel } from "@/application/casos-de-uso/montar-painel";
import { obterContainer } from "@/infrastructure/container";
import { formatBRL, formatData } from "@/lib/format";

export default async function AdminPage() {
  const { repos, usuarioAtual } = await obterContainer();
  const usuario = await usuarioAtual();
  const hoje = new Date();
  const p = await montarPainel(repos)(usuario, hoje);
  const t = p.totais;
  const metaOk = t.precosAtualizadosPct >= 90;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do painel */}
      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-marca-900 p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-sm text-white/70">{formatData(hoje)}</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Olá, {usuario?.nome ?? "administrador"} 👋</h1>
          <p className="mt-1 text-sm text-white/75">Visão geral do catálogo, dos preços e do que precisa de atenção hoje.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Acao href="/admin/precos" icone={Plus} texto="Atualizar preços" destaque />
          <Acao href="/admin/medicamentos" icone={Pill} texto="Medicamentos" />
          <Acao href="/" icone={ExternalLink} texto="Ver site" />
        </div>
      </div>

      {/* Indicadores */}
      <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador href="/admin/precos" icone={CalendarClock} rotulo="Preços atualizados em até 7 dias" valor={`${t.precosAtualizadosPct}%`}
          detalhe={`${t.precos - t.precosDesatualizados} de ${t.precos} preços · meta 90%`}
          status={metaOk ? { tipo: "ok", texto: "Dentro da meta" } : { tipo: "alerta", texto: `${t.precosDesatualizados} desatualizados` }} />
        <Indicador href="/admin/reportes" icone={Flag} rotulo="Reportes de preço abertos" valor={String(t.reportesAbertos)}
          detalhe="Avisos de usuários sobre preço errado"
          status={t.reportesAbertos ? { tipo: "alerta", texto: "Revisar" } : { tipo: "ok", texto: "Nada pendente" }} />
        <Indicador href="/admin/medicamentos" icone={Pill} rotulo="Medicamentos no catálogo" valor={String(t.medicamentos)}
          detalhe={`${t.categorias} categorias · ${t.semPreco} sem preço`} />
        <Indicador href="/admin/farmacias" icone={Store} rotulo="Farmácias" valor={String(t.farmacias)}
          detalhe={`${t.parceiras} parceiras com cupom`} />
        <Indicador href="/admin/cupons" icone={Ticket} rotulo="Cupons vigentes" valor={String(t.cuponsVigentes)}
          detalhe={`${t.cuponsVencidos} vencidos`} />
        <Indicador icone={TrendingDown} rotulo="Economia média do genérico" valor={t.economiaMediaPct !== null ? `${t.economiaMediaPct}%` : "—"}
          detalhe="Genérico/similar contra o de referência" />
        <Indicador href="/admin/medicamentos" icone={Camera} rotulo="Medicamentos com foto" valor={`${t.comFoto}/${t.medicamentos}`}
          detalhe="Fotos com licença livre e crédito" />
        <Indicador href="/admin/precos" icone={CheckCircle2} rotulo="Preços cadastrados" valor={String(t.precos)}
          detalhe={`Média de ${t.farmacias ? Math.round(t.precos / t.farmacias) : 0} por farmácia`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Idade dos preços */}
        <Cartao titulo="Idade dos preços" subtitulo="Quantos dias desde a última atualização" acao={{ href: "/admin/precos", texto: "Ver preços" }}>
          <ListaBarras itens={p.idadePrecos.map((f) => ({ rotulo: f.faixa, valor: f.qtd, alerta: f.alerta }))} total={t.precos} unidade="preços" />
        </Cartao>

        {/* Cobertura por farmácia */}
        <Cartao titulo="Cobertura por farmácia" subtitulo={`Medicamentos com preço, de ${t.medicamentos} no catálogo`} acao={{ href: "/admin/farmacias", texto: "Farmácias" }}>
          <ListaBarras itens={p.coberturaFarmacias.map((f) => ({ rotulo: f.nome.replace(/^(Farmácia|Drogaria)\s+/, ""), valor: f.qtd, extra: `${f.pct}%` }))} total={t.medicamentos} unidade="medicamentos" />
        </Cartao>

        {/* Catálogo por categoria */}
        <Cartao titulo="Catálogo por categoria" subtitulo="Medicamentos cadastrados" acao={{ href: "/admin/categorias", texto: "Categorias" }}>
          <ListaBarras itens={p.porCategoria.map((c) => ({ rotulo: c.nome, valor: c.qtd }))} total={t.medicamentos} unidade="medicamentos" />
        </Cartao>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Cartao titulo="Reportes abertos" subtitulo="Mais recentes primeiro" acao={{ href: "/admin/reportes", texto: "Resolver" }}>
          {p.reportesAbertos.length === 0 ? <Vazio texto="Nenhum reporte pendente." /> : (
            <ul className="divide-y divide-black/5">
              {p.reportesAbertos.map((r) => (
                <li key={r.id} className="py-2.5 text-sm">
                  <p className="font-semibold">{r.medicamento} · {formatBRL(r.valor)}</p>
                  <p className="text-xs text-suave">{r.farmacia} · {formatData(r.criadoEm)}</p>
                  {r.comentario && <p className="mt-1 text-xs italic text-tinta/80">“{r.comentario}”</p>}
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao titulo="Preços mais antigos" subtitulo="Atualize primeiro estes" acao={{ href: "/admin/precos", texto: "Atualizar" }}>
          {p.maisAntigos.length === 0 ? <Vazio texto="Todos os preços estão em dia." /> : (
            <ul className="divide-y divide-black/5">
              {p.maisAntigos.map((x) => (
                <li key={x.precoId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{x.medicamento}</p>
                    <p className="truncate text-xs text-suave">{x.farmacia}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    <AlertTriangle className="size-3" aria-hidden /> {x.dias} dias
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao titulo="Sem preço cadastrado" subtitulo="Não aparecem na comparação" acao={{ href: "/admin/precos", texto: "Cadastrar" }}>
          {p.semPreco.length === 0 ? <Vazio texto="Todos têm preço." /> : (
            <ul className="divide-y divide-black/5">
              {p.semPreco.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-semibold">{m.nome}</span>
                  <Link href={`/medicamento/${m.id}`} className="text-xs text-marca-700 underline">ver</Link>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </div>

      <Cartao titulo="Maiores economias com genéricos" subtitulo="Menor preço do genérico/similar contra o menor preço do medicamento de referência">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-suave">
              <tr><th className="py-2 font-semibold">Medicamento</th><th className="py-2 font-semibold">Genérico/similar</th><th className="py-2 font-semibold">Referência</th><th className="py-2 text-right font-semibold">Economia</th></tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {p.maioresEconomias.map((m) => (
                <tr key={m.id}>
                  <td className="py-2.5"><Link href={`/medicamento/${m.id}`} className="font-semibold hover:underline">{m.nomeComercial}</Link></td>
                  <td className="py-2.5">{m.menorPreco !== null ? formatBRL(m.menorPreco) : "—"}</td>
                  <td className="py-2.5 text-suave">{m.precoReferencia ? formatBRL(m.precoReferencia) : "—"}</td>
                  <td className="py-2.5 text-right font-bold text-marca-700">{m.economiaPercentual ? `${m.economiaPercentual}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Cartao>
    </div>
  );
}

function Acao({ href, icone: Icone, texto, destaque = false }: { href: string; icone: LucideIcon; texto: string; destaque?: boolean }) {
  return (
    <Link href={href} className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${destaque ? "bg-white text-marca-900 hover:bg-menta-100" : "bg-white/10 hover:bg-white/20"}`}>
      <Icone className="size-4" aria-hidden /> {texto}
    </Link>
  );
}

type Status = { tipo: "ok" | "alerta"; texto: string };

function Indicador({ href, icone: Icone, rotulo, valor, detalhe, status }: {
  href?: string; icone: LucideIcon; rotulo: string; valor: string; detalhe: string; status?: Status;
}) {
  const corpo = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-menta-100 text-marca-800"><Icone className="size-4" aria-hidden /></span>
        {status && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.tipo === "ok" ? "bg-menta-100 text-marca-800" : "bg-amber-100 text-amber-900"}`}>
            {status.tipo === "ok" ? <CheckCircle2 className="size-3" aria-hidden /> : <AlertTriangle className="size-3" aria-hidden />}
            {status.texto}
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold text-tinta">{valor}</p>
      <p className="mt-0.5 text-sm font-semibold text-tinta">{rotulo}</p>
      <p className="mt-1 text-xs text-suave">{detalhe}</p>
    </>
  );
  const css = "block rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-black/5 sm:p-5";
  return href ? <Link href={href} className={`${css} transition hover:shadow-md hover:ring-marca-600/30`}>{corpo}</Link> : <div className={css}>{corpo}</div>;
}

function Cartao({ titulo, subtitulo, acao, children }: {
  titulo: string; subtitulo?: string; acao?: { href: string; texto: string }; children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-black/5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-tinta">{titulo}</h2>
          {subtitulo && <p className="text-xs text-suave">{subtitulo}</p>}
        </div>
        {acao && (
          <Link href={acao.href} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-marca-700 hover:underline">
            {acao.texto} <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Barras horizontais de uma série (uma cor); alerta usa ícone + texto, não só cor. */
function ListaBarras({ itens, total, unidade }: {
  itens: { rotulo: string; valor: number; extra?: string; alerta?: boolean }[]; total: number; unidade: string;
}) {
  const maximo = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <ul className="space-y-2.5">
      {itens.map((i) => (
        <li key={i.rotulo} title={`${i.rotulo}: ${i.valor} ${unidade}${total ? ` (${Math.round((i.valor / total) * 100)}% do total)` : ""}`}>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-1 truncate font-medium text-tinta">
              {i.alerta && <AlertTriangle className="size-3 shrink-0 text-amber-700" aria-label="Atenção" />}
              {i.rotulo}
            </span>
            <span className="shrink-0 tabular-nums text-suave">
              <strong className="text-tinta">{i.valor}</strong>{i.extra ? ` · ${i.extra}` : ""}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-[#eef2ef]">
            <div className={`h-2 rounded-full ${i.alerta ? "bg-amber-500" : "bg-marca-600"}`} style={{ width: `${(i.valor / maximo) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Vazio({ texto }: { texto: string }) {
  return <p className="flex items-center gap-2 py-4 text-sm text-suave"><CheckCircle2 className="size-4 text-marca-600" aria-hidden /> {texto}</p>;
}
