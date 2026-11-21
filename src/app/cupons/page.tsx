import type { Metadata } from "next";
import { listarCuponsVigentes } from "@/application/casos-de-uso/listar-cupons-vigentes";
import type { Cupom } from "@/domain/cupom";
import { obterContainer } from "@/infrastructure/container";
import { CopiarCodigo } from "@/components/CopiarCodigo";
import { formatData } from "@/lib/format";

export const metadata: Metadata = { title: "Cupons — E-Farmácia" };

export default async function CuponsPage() {
  const { repos } = await obterContainer();
  const cupons = await listarCuponsVigentes(repos)(new Date());

  const porFarmacia = new Map<string, Cupom[]>();
  for (const c of cupons) porFarmacia.set(c.farmacia.nome, [...(porFarmacia.get(c.farmacia.nome) ?? []), c]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-marca-900">Cupons das farmácias parceiras</h1>
      <p className="text-sm text-suave">Apresente o código no caixa da farmácia. <span className="font-semibold">Dados de demonstração.</span></p>

      {cupons.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-suave ring-1 ring-black/5">Nenhum cupom vigente no momento.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...porFarmacia].map(([farmacia, lista]) => (
            <section key={farmacia} className="rounded-[var(--radius-card)] bg-creme p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-suave">{farmacia}</h2>
              <ul className="mt-3 space-y-3">
                {lista.map((c) => (
                  <li key={c.id} className="rounded-2xl bg-white p-4">
                    <p className="text-xl font-bold text-marca-900">{c.desconto} de desconto</p>
                    <p className="text-sm text-suave">{c.descricao}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <CopiarCodigo codigo={c.codigo} />
                      <span className="text-xs text-suave">Válido até {formatData(c.validade)}</span>
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
