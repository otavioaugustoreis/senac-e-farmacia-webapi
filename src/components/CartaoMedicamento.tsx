import Link from "next/link";
import type { ResultadoBusca } from "@/domain/medicamento";
import { formatBRL } from "@/lib/format";
import { CaixaMedicamento, SeloTipo } from "./visual";

interface Props {
  medicamento: ResultadoBusca;
  precoReferencia?: number | null;
  economiaPercentual?: number | null;
}

export function CartaoMedicamento({ medicamento: m, precoReferencia, economiaPercentual }: Props) {
  return (
    <Link href={`/medicamento/${m.id}`} className="group flex flex-col rounded-[var(--radius-card)] bg-white p-3 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <CaixaMedicamento categoria={m.categoria?.nome} nome={m.nomeComercial} />
        {economiaPercentual ? (
          <span className="absolute right-2 top-2 rounded-md bg-alerta px-1.5 py-0.5 text-xs font-bold text-white">-{economiaPercentual}%</span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-suave">{m.categoria?.nome ?? "Sem categoria"}</span>
        <SeloTipo tipo={m.tipo} />
      </div>
      <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-tinta group-hover:text-marca-700">{m.nomeComercial}</h3>
      <p className="text-xs text-suave">{m.principioAtivo} · {m.apresentacao}</p>
      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <div>
          {m.menorPreco !== null ? (
            <>
              <span className="block text-[11px] text-suave">a partir de</span>
              <span className="whitespace-nowrap text-lg font-bold text-marca-700">{formatBRL(m.menorPreco)}</span>
              {precoReferencia ? (
                <span className="block whitespace-nowrap text-xs text-suave line-through sm:ml-1.5 sm:inline">{formatBRL(precoReferencia)}</span>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-suave">—</span>
          )}
        </div>
        <span className="hidden shrink-0 whitespace-nowrap rounded-full border border-marca-700/30 px-3 py-1 text-xs font-semibold text-marca-800 group-hover:bg-marca-800 group-hover:text-white sm:inline-block">
          Ver preços
        </span>
      </div>
    </Link>
  );
}
