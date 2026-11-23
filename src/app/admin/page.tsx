import Link from "next/link";
import {
  AlertTriangle, ArrowRight, CalendarClock, Camera, CheckCircle2, ExternalLink, Flag, Pill, Plus, Store, Ticket, TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { buildDashboard } from "@/application/use-cases/build-dashboard";
import { getContainer } from "@/infrastructure/container";
import { formatBRL, formatDate } from "@/lib/format";

export default async function AdminPage() {
  const { repos, currentUser } = await getContainer();
  const user = await currentUser();
  const today = new Date();
  const p = await buildDashboard(repos)(user, today);
  const t = p.totals;
  const metaOk = t.freshPricesPct >= 90;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do painel */}
      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-brand-900 p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-sm text-white/70">{formatDate(today)}</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Olá, {user?.name ?? "administrador"} 👋</h1>
          <p className="mt-1 text-sm text-white/75">Visão geral do catálogo, dos preços e do que precisa de atenção hoje.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Action href="/admin/precos" icon={Plus} text="Atualizar preços" featured />
          <Action href="/admin/medicamentos" icon={Pill} text="Medicamentos" />
          <Action href="/" icon={ExternalLink} text="Ver site" />
        </div>
      </div>

      {/* Indicadores */}
      <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicator href="/admin/precos" icon={CalendarClock} label="Preços atualizados em até 7 dias" value={`${t.freshPricesPct}%`}
          detail={`${t.prices - t.outdatedPrices} de ${t.prices} preços · meta 90%`}
          status={metaOk ? { type: "ok", text: "Dentro da meta" } : { type: "warning", text: `${t.outdatedPrices} desatualizados` }} />
        <Indicator href="/admin/reportes" icon={Flag} label="Reportes de preço abertos" value={String(t.openReports)}
          detail="Avisos de usuários sobre preço errado"
          status={t.openReports ? { type: "warning", text: "Revisar" } : { type: "ok", text: "Nada pendente" }} />
        <Indicator href="/admin/medicamentos" icon={Pill} label="Medicamentos no catálogo" value={String(t.medicines)}
          detail={`${t.categories} categorias · ${t.withoutPrice} sem preço`} />
        <Indicator href="/admin/farmacias" icon={Store} label="Farmácias" value={String(t.pharmacies)}
          detail={`${t.partners} parceiras com cupom`} />
        <Indicator href="/admin/cupons" icon={Ticket} label="Cupons vigentes" value={String(t.activeCoupons)}
          detail={`${t.expiredCoupons} vencidos`} />
        <Indicator icon={TrendingDown} label="Economia média do genérico" value={t.averageSavingsPct !== null ? `${t.averageSavingsPct}%` : "—"}
          detail="Genérico/similar contra o de referência" />
        <Indicator href="/admin/medicamentos" icon={Camera} label="Medicamentos com foto" value={`${t.withPhoto}/${t.medicines}`}
          detail="Fotos com licença livre e crédito" />
        <Indicator href="/admin/precos" icon={CheckCircle2} label="Preços cadastrados" value={String(t.prices)}
          detail={`Média de ${t.pharmacies ? Math.round(t.prices / t.pharmacies) : 0} por farmácia`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Idade dos preços */}
        <Card title="Idade dos preços" subtitle="Quantos dias desde a última atualização" action={{ href: "/admin/precos", text: "Ver preços" }}>
          <BarList items={p.priceAge.map((f) => ({ label: f.bucket, amount: f.count, warning: f.warning }))} total={t.prices} unit="preços" />
        </Card>

        {/* Cobertura por farmácia */}
        <Card title="Cobertura por farmácia" subtitle={`Medicamentos com preço, de ${t.medicines} no catálogo`} action={{ href: "/admin/farmacias", text: "Farmácias" }}>
          <BarList items={p.pharmacyCoverage.map((f) => ({ label: f.name.replace(/^(Farmácia|Drogaria)\s+/, ""), amount: f.count, extra: `${f.pct}%` }))} total={t.medicines} unit="medicamentos" />
        </Card>

        {/* Catálogo por categoria */}
        <Card title="Catálogo por categoria" subtitle="Medicamentos cadastrados" action={{ href: "/admin/categorias", text: "Categorias" }}>
          <BarList items={p.byCategory.map((c) => ({ label: c.name, amount: c.count }))} total={t.medicines} unit="medicamentos" />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Reportes abertos" subtitle="Mais recentes primeiro" action={{ href: "/admin/reportes", text: "Resolver" }}>
          {p.openReports.length === 0 ? <Empty text="Nenhum reporte pendente." /> : (
            <ul className="divide-y divide-black/5">
              {p.openReports.map((r) => (
                <li key={r.id} className="py-2.5 text-sm">
                  <p className="font-semibold">{r.medicine} · {formatBRL(r.amount)}</p>
                  <p className="text-xs text-muted">{r.pharmacy} · {formatDate(r.createdAt)}</p>
                  {r.comment && <p className="mt-1 text-xs italic text-ink/80">“{r.comment}”</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Preços mais antigos" subtitle="Atualize primeiro estes" action={{ href: "/admin/precos", text: "Atualizar" }}>
          {p.oldest.length === 0 ? <Empty text="Todos os preços estão em dia." /> : (
            <ul className="divide-y divide-black/5">
              {p.oldest.map((x) => (
                <li key={x.priceId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{x.medicine}</p>
                    <p className="truncate text-xs text-muted">{x.pharmacy}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    <AlertTriangle className="size-3" aria-hidden /> {x.days} dias
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Sem preço cadastrado" subtitle="Não aparecem na comparação" action={{ href: "/admin/precos", text: "Cadastrar" }}>
          {p.withoutPrice.length === 0 ? <Empty text="Todos têm preço." /> : (
            <ul className="divide-y divide-black/5">
              {p.withoutPrice.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-semibold">{m.name}</span>
                  <Link href={`/medicamento/${m.id}`} className="text-xs text-brand-700 underline">ver</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Maiores economias com genéricos" subtitle="Menor preço do genérico/similar contra o menor preço do medicamento de referência">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr><th className="py-2 font-semibold">Medicamento</th><th className="py-2 font-semibold">Genérico/similar</th><th className="py-2 font-semibold">Referência</th><th className="py-2 text-right font-semibold">Economia</th></tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {p.topSavings.map((m) => (
                <tr key={m.id}>
                  <td className="py-2.5"><Link href={`/medicamento/${m.id}`} className="font-semibold hover:underline">{m.brandName}</Link></td>
                  <td className="py-2.5">{m.lowestPrice !== null ? formatBRL(m.lowestPrice) : "—"}</td>
                  <td className="py-2.5 text-muted">{m.referencePrice ? formatBRL(m.referencePrice) : "—"}</td>
                  <td className="py-2.5 text-right font-bold text-brand-700">{m.savingsPercent ? `${m.savingsPercent}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Action({ href, icon: Icon, text, featured = false }: { href: string; icon: LucideIcon; text: string; featured?: boolean }) {
  return (
    <Link href={href} className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${featured ? "bg-white text-brand-900 hover:bg-mint-100" : "bg-white/10 hover:bg-white/20"}`}>
      <Icon className="size-4" aria-hidden /> {text}
    </Link>
  );
}

type Status = { type: "ok" | "warning"; text: string };

function Indicator({ href, icon: Icon, label, value, detail, status }: {
  href?: string; icon: LucideIcon; label: string; value: string; detail: string; status?: Status;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-mint-100 text-brand-800"><Icon className="size-4" aria-hidden /></span>
        {status && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.type === "ok" ? "bg-mint-100 text-brand-800" : "bg-amber-100 text-amber-900"}`}>
            {status.type === "ok" ? <CheckCircle2 className="size-3" aria-hidden /> : <AlertTriangle className="size-3" aria-hidden />}
            {status.text}
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{label}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </>
  );
  const css = "block rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-black/5 sm:p-5";
  return href ? <Link href={href} className={`${css} transition hover:shadow-md hover:ring-brand-600/30`}>{body}</Link> : <div className={css}>{body}</div>;
}

function Card({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: { href: string; text: string }; children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-black/5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {action && (
          <Link href={action.href} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
            {action.text} <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Barras horizontais de uma série (uma cor); alerta usa ícone + texto, não só cor. */
function BarList({ items, total, unit }: {
  items: { label: string; amount: number; extra?: string; warning?: boolean }[]; total: number; unit: string;
}) {
  const maximum = Math.max(1, ...items.map((i) => i.amount));
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.label} title={`${i.label}: ${i.amount} ${unit}${total ? ` (${Math.round((i.amount / total) * 100)}% do total)` : ""}`}>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-1 truncate font-medium text-ink">
              {i.warning && <AlertTriangle className="size-3 shrink-0 text-amber-700" aria-label="Atenção" />}
              {i.label}
            </span>
            <span className="shrink-0 tabular-nums text-muted">
              <strong className="text-ink">{i.amount}</strong>{i.extra ? ` · ${i.extra}` : ""}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-[#eef2ef]">
            <div className={`h-2 rounded-full ${i.warning ? "bg-amber-500" : "bg-brand-600"}`} style={{ width: `${(i.amount / maximum) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="flex items-center gap-2 py-4 text-sm text-muted"><CheckCircle2 className="size-4 text-brand-600" aria-hidden /> {text}</p>;
}
