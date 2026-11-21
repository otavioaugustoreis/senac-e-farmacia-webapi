import { Pill } from "lucide-react";
import { visualDaCategoria } from "./visual";

/** Frasco/caixa ilustrado em CSS (substitui fotos de produto). */
export function Frasco({ categoria, rotulo, className = "" }: { categoria: string; rotulo: string; className?: string }) {
  const v = visualDaCategoria(categoria);
  const Icone = v.icone;
  return (
    <div className={`flex flex-col items-center drop-shadow-xl ${className}`} aria-hidden>
      <div className="h-[14%] w-[70%] rounded-t-lg" style={{ background: v.tampa }} />
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-white px-1 ring-1 ring-black/5">
        <Icone className="size-[34%]" style={{ color: v.tampa }} />
        <span className="text-center text-[10px] font-bold leading-tight text-tinta">{rotulo}</span>
        <span className="h-1 w-1/2 rounded-full" style={{ background: v.fundo }} />
      </div>
    </div>
  );
}

/** Painel do hero: composição de embalagens + cartão flutuante (como a foto com o selo "98%"). */
export function PainelHero({ economia }: { economia: number | null }) {
  return (
    <div className="relative h-64 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#e7f1e9] via-[#f3efe4] to-[#f8e9d8] sm:h-80 lg:h-full lg:min-h-[22rem]">
      <div className="absolute -left-10 -top-10 size-48 rounded-full bg-white/50" />
      <div className="absolute -bottom-16 right-10 size-56 rounded-full bg-[#dcebdf]" />
      <div className="absolute inset-0 flex items-end justify-start gap-3 pb-10 pl-6 sm:justify-center sm:gap-5 sm:pb-12 sm:pl-0">
        <Frasco categoria="Vitaminas" rotulo="Vitamina D" className="hidden h-28 w-20 -rotate-6 sm:flex sm:h-36 sm:w-24" />
        <Frasco categoria="Analgésicos e antitérmicos" rotulo="Dipirona" className="h-40 w-28 sm:h-52 sm:w-36" />
        <Frasco categoria="Anti-hipertensivos" rotulo="Losartana" className="h-28 w-20 rotate-6 sm:h-40 sm:w-28" />
      </div>
      <div className="absolute bottom-3 right-3 max-w-[44%] rounded-2xl bg-white p-3 shadow-lg sm:bottom-5 sm:right-5 sm:max-w-none sm:p-4">
        <p className="text-2xl font-bold text-tinta sm:text-4xl">
          {economia ?? "—"}<sup className="text-base">%</sup>
        </p>
        <div className="mt-1 flex -space-x-2">
          {["Analgésicos e antitérmicos", "Antialérgicos", "Diabetes"].map((c) => {
            const v = visualDaCategoria(c);
            const Icone = v.icone;
            return (
              <span key={c} className="grid size-7 place-items-center rounded-full ring-2 ring-white" style={{ background: v.fundo }}>
                <Icone className="size-3.5" style={{ color: v.tampa }} aria-hidden />
              </span>
            );
          })}
        </div>
        <p className="mt-1.5 max-w-[9rem] text-xs leading-snug text-suave">de economia média com genéricos e similares</p>
      </div>
      <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-marca-800">
        <Pill className="size-3.5" aria-hidden /> Bula oficial Anvisa
      </span>
    </div>
  );
}
