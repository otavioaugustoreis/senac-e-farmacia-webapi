import Link from "next/link";
import { TYPE_LABELS, type SearchResult } from "@/domain/medicamento";
import { formatBRL } from "@/lib/format";
import { MedicineImage } from "./FotoMedicamento";

interface Props {
  medicine: SearchResult;
  referencePrice?: number | null;
  savingsPercent?: number | null;
}

/** Cartão no estilo vitrine: imagem em fundo claro, selo de desconto, preço e "Ver preços". */
export function MedicineCard({ medicine: m, referencePrice, savingsPercent }: Props) {
  return (
    <Link href={`/medicamento/${m.id}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-[#f3f5f4] transition group-hover:bg-menta-100">
        <MedicineImage medicine={m} />
        {savingsPercent ? (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-alerta px-1.5 py-0.5 text-[11px] font-bold text-white">{savingsPercent}%</span>
        ) : null}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-suave">
        <span className="truncate">{m.category?.name ?? "Medicamento"}</span>
      </div>
      <p className="mt-0.5 text-[11px] font-semibold text-marca-600">{TYPE_LABELS[m.type]} · {m.manufacturer}</p>
      <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-tinta group-hover:text-marca-700 sm:text-base">{m.brandName}</h3>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
        {m.lowestPrice !== null ? (
          <>
            <span className="whitespace-nowrap text-base font-bold text-marca-700 sm:text-lg">{formatBRL(m.lowestPrice)}</span>
            {referencePrice ? <span className="whitespace-nowrap text-xs text-suave line-through">{formatBRL(referencePrice)}</span> : null}
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
