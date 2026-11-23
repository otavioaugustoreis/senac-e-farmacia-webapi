import type { Metadata } from "next";
import { listActiveCoupons } from "@/application/use-cases/list-active-coupons";
import type { Coupon } from "@/domain/coupon";
import { getContainer } from "@/infrastructure/container";
import { UseCouponButton } from "@/components/UseCouponButton";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Cupons — E-Farmácia" };

export default async function CouponsPage() {
  const { repos } = await getContainer();
  const coupons = await listActiveCoupons(repos)(new Date());

  const byPharmacy = new Map<string, Coupon[]>();
  for (const c of coupons) byPharmacy.set(c.pharmacy.name, [...(byPharmacy.get(c.pharmacy.name) ?? []), c]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Cupons das farmácias parceiras</h1>
      <p className="text-sm text-muted">Toque em “Usar na farmácia” e mostre o QR code no caixa. <span className="font-semibold">Dados de demonstração.</span></p>

      {coupons.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-muted ring-1 ring-black/5">Nenhum cupom vigente no momento.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...byPharmacy].map(([pharmacy, list]) => (
            <section key={pharmacy} className="rounded-[var(--radius-card)] bg-cream p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{pharmacy}</h2>
              <ul className="mt-3 space-y-3">
                {list.map((c) => (
                  <li key={c.id} className="rounded-2xl bg-white p-4">
                    <p className="text-xl font-bold text-brand-900">{c.discount} de desconto</p>
                    <p className="text-sm text-muted">{c.description}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-black/10 pt-3 text-xs text-muted">
                      <span>Código <span className="font-mono font-bold tracking-wider text-brand-800">{c.code}</span></span>
                      <span>Válido até {formatDate(c.validUntil)}</span>
                    </div>
                    <div className="mt-3 grid">
                      <UseCouponButton coupon={{ ...c, validUntil: formatDate(c.validUntil) }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
