import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ExternalLink, Ticket } from "lucide-react";
import { getMedicineDetail, type MedicineDetail } from "@/application/use-cases/get-medicine-detail";
import { ANVISA_INSERTS_URL } from "@/domain/package-insert";
import { NotFoundError } from "@/domain/errors";
import { getContainer } from "@/infrastructure/container";
import { MedicineCard } from "@/components/MedicineCard";
import { ReportPriceButton } from "@/components/ReportPriceButton";
import { TypeBadge } from "@/components/visual";
import { MedicineImage } from "@/components/MedicineImage";
import { UseCouponButton } from "@/components/UseCouponButton";
import { formatBRL, formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

async function load(idText: string): Promise<{ detail: MedicineDetail; isLoggedIn: boolean }> {
  const id = Number(idText);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const { repos, currentUser } = await getContainer();
  try {
    const [detail, user] = await Promise.all([getMedicineDetail(repos)(id, new Date()), currentUser()]);
    return { detail, isLoggedIn: user !== null };
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { repos } = await getContainer();
  const m = Number.isInteger(Number(id)) ? await repos.medicines.getById(Number(id)) : null;
  return { title: m ? `${m.brandName} — preços e bula | E-Farmácia` : "Medicamento — E-Farmácia" };
}

export default async function MedicinePage({ params }: Props) {
  const { id } = await params;
  const { detail: d, isLoggedIn } = await load(id);
  const m = d.medicine;
  const path = `/medicamento/${m.id}`;

  const sections = [
    ["Para que serve", d.packageInsert?.usedFor],
    ["Como usar", d.howToUse],
    ["Contraindicações", d.packageInsert?.contraindications],
    ["Efeitos colaterais", d.packageInsert?.sideEffects],
    ["Advertências", d.packageInsert?.warnings],
  ] as const;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted">
        <Link href="/busca" className="underline">Medicamentos</Link>
        {m.category && <> / <Link href={`/busca?categoria=${m.category.id}`} className="underline">{m.category.name}</Link></>}
      </nav>

      <section className="grid gap-6 md:grid-cols-[320px_1fr]">
        <figure className={m.image ? "" : "hidden md:block"}>
          <MedicineImage medicine={m} variant="featured" />
          {m.image && (
            <figcaption className="mt-2 text-[11px] leading-snug text-muted">
              Imagem ilustrativa, pode diferir da embalagem real.{" "}
              {m.image.source.startsWith("https://")
                ? <a href={m.image.source} target="_blank" rel="noreferrer" className="underline">{m.image.credit}</a>
                : m.image.credit}
            </figcaption>
          )}
        </figure>
        <div>
          <TypeBadge type={m.type} />
          <h1 className="mt-2 text-2xl font-bold leading-tight text-brand-900 sm:text-3xl">{m.brandName}</h1>
          <p className="mt-1 text-muted">
            <span className="font-medium text-ink">{m.activeIngredient}</span> · {m.presentation} · {m.manufacturer}
          </p>
          <div className="mt-4 rounded-2xl bg-mint-50 p-4 ring-1 ring-brand-600/10">
            {d.lowestPrice ? (
              <>
                <p className="text-sm text-muted">Menor preço encontrado</p>
                <p className="text-3xl font-bold text-brand-700">{formatBRL(d.lowestPrice.amount)}</p>
                <p className="text-sm text-muted">em {d.lowestPrice.pharmacy.name} · atualizado em {formatDate(d.lowestPrice.updatedAt)}</p>
              </>
            ) : (
              <p className="font-medium">Sem preços cadastrados para este medicamento.</p>
            )}
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-muted">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            O E-Farmácia informa, não substitui a orientação de médico ou farmacêutico.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section aria-labelledby="title-prices">
            <div className="flex items-baseline justify-between gap-2">
              <h2 id="title-prices" className="text-xl font-bold text-brand-900">Preços por farmácia</h2>
              <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-semibold text-amber-800">Dados de demonstração</span>
            </div>
            {d.prices.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-white p-6 text-center text-muted ring-1 ring-black/5">Sem preços cadastrados.</p>
            ) : (
              <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
                {d.prices.map((p, i) => (
                  <li key={p.id} className={`p-4 ${i === 0 ? "bg-mint-50" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug">{p.pharmacy.name}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                          {i === 0 && <span className="rounded-full bg-brand-800 px-2 py-0.5 text-[11px] font-semibold text-white">Menor preço</span>}
                          <span>Atualizado em {formatDate(p.updatedAt)}</span>
                          {p.outdated && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">Desatualizado</span>}
                        </p>
                      </div>
                      <p className="shrink-0 whitespace-nowrap text-xl font-bold text-brand-700">{formatBRL(p.amount)}</p>
                    </div>
                    <div className="mt-1"><ReportPriceButton priceId={p.id} isLoggedIn={isLoggedIn} returnTo={path} /></div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/farmacias" className="mt-2 inline-block text-sm font-semibold text-brand-700 underline">Ver farmácias no mapa</Link>
          </section>

          <section aria-labelledby="title-package-insert">
            <h2 id="title-package-insert" className="text-xl font-bold text-brand-900">Bula organizada</h2>
            <div className="mt-3 space-y-2">
              {sections.map(([title, text], i) => (
                <details key={title} open={i < 2} className="group rounded-2xl bg-white p-4 ring-1 ring-black/5">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">
                    <span className="mr-2 inline-block text-brand-600 transition group-open:rotate-90">›</span>{title}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink/90">{text || "Consulte a bula oficial."}</p>
                </details>
              ))}
            </div>
            <a href={d.packageInsert?.anvisaLink || ANVISA_INSERTS_URL} target="_blank" rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 underline">
              Bula completa no Bulário Eletrônico da Anvisa <ExternalLink className="size-4" aria-hidden />
            </a>
          </section>
        </div>

        <aside className="space-y-8">
          {d.coupons.length > 0 && (
            <section aria-labelledby="title-coupons" className="rounded-2xl bg-cream p-5">
              <h2 id="title-coupons" className="flex items-center gap-2 font-bold text-brand-900"><Ticket className="size-5" aria-hidden /> Cupons das farmácias</h2>
              <ul className="mt-3 space-y-2">
                {d.coupons.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold">{c.discount} · {c.pharmacy.name}</p>
                      <p className="text-xs text-muted">{c.description} · até {formatDate(c.validUntil)}</p>
                    </div>
                    <UseCouponButton coupon={{ ...c, validUntil: formatDate(c.validUntil) }} compact />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="title-alternatives">
            <h2 id="title-alternatives" className="text-xl font-bold text-brand-900">Alternativas</h2>
            <p className="text-sm text-muted">Mesmo princípio ativo ({m.activeIngredient})</p>
            {d.alternatives.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Nenhuma alternativa cadastrada.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 lg:grid-cols-2">
                {d.alternatives.map((a) => <MedicineCard key={a.id} medicine={a} />)}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
