import Link from "next/link";
import { ROTULO_TIPO, type ResultadoBusca } from "@/domain/medicamento";
import { formatBRL } from "@/lib/format";
import { CaixaMedicamento } from "./visual";

interface Props {
  medicamento: ResultadoBusca;
  precoReferencia?: number | null;
  economiaPercentual?: number | null;
}

/** Cartão no estilo vitrine: imagem em fundo claro, selo de desconto, preço e "Ver preços". */
export function CartaoMedicamento({ medicamento: m, precoReferencia, economiaPercentual }: Props) {
  return (
    <Link href={`/medicamento/${m.id}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-[#f3f5f4] transition group-hover:bg-menta-100">
        <CaixaMedicamento categoria={m.categoria?.nome} nome={m.nomeComercial} neutro />
        {economiaPercentual ? (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-alerta px-1.5 py-0.5 text-[11px] font-bold text-white">{economiaPercentual}%</span>
        ) : null}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-suave">
        <span className="truncate">{m.categoria?.nome ?? "Medicamento"}</span>
      </div>
      <p className="mt-0.5 text-[11px] font-semibold text-marca-600">{ROTULO_TIPO[m.tipo]} · {m.fabricante}</p>
      <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-tinta group-hover:text-marca-700 sm:text-base">{m.nomeComercial}</h3>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
        {m.menorPreco !== null ? (
          <>
            <span className="whitespace-nowrap text-base font-bold text-marca-700 sm:text-lg">{formatBRL(m.menorPreco)}</span>
            {precoReferencia ? <span className="whitespace-nowrap text-xs text-suave line-through">{formatBRL(precoReferencia)}</span> : null}
          </>
        ) : (
          <span className="text-sm text-suave">Sem preço</span>
        )}
      </div>
      <span className="mt-2 w-fit rounded-full border border-black/15 px-3 py-1 text-xs font-medium text-tinta transition group-hover:border-marca-800 group-hover:bg-marca-800 group-hover:text-white">
        Ver preços
      </span>
    </Link>
  );
}
