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
