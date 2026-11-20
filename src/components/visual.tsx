import {
  Activity, Droplet, Flower2, HeartPulse, Pill, ShieldPlus, Stethoscope, Sun, Thermometer, type LucideIcon,
} from "lucide-react";
import { ROTULO_TIPO, type TipoMedicamento } from "@/domain/medicamento";
import { normalizarTexto } from "@/domain/texto";

interface VisualCategoria {
  icone: LucideIcon;
  subtitulo: string;
  fundo: string;
  tampa: string;
}

const VISUAIS: Record<string, VisualCategoria> = {
  "analgesicos e antitermicos": { icone: Thermometer, subtitulo: "Dor e febre", fundo: "#fde8d7", tampa: "#e8743b" },
  "anti-inflamatorios": { icone: Activity, subtitulo: "Inflamação", fundo: "#fbe3e8", tampa: "#d1495b" },
  antibioticos: { icone: ShieldPlus, subtitulo: "Infecções", fundo: "#e0ecfb", tampa: "#3a6fc4" },
  "anti-hipertensivos": { icone: HeartPulse, subtitulo: "Pressão arterial", fundo: "#ece4fb", tampa: "#7650c9" },
  gastrointestinais: { icone: Stethoscope, subtitulo: "Estômago", fundo: "#fdf3d2", tampa: "#c99a1a" },
  antialergicos: { icone: Flower2, subtitulo: "Alergias", fundo: "#e3f5ee", tampa: "#2f9a72" },
  diabetes: { icone: Droplet, subtitulo: "Glicose", fundo: "#dff3f7", tampa: "#2391a8" },
  vitaminas: { icone: Sun, subtitulo: "Suplementos", fundo: "#fff1d6", tampa: "#e0a100" },
};

const PADRAO: VisualCategoria = { icone: Pill, subtitulo: "Medicamentos", fundo: "#e9f6ee", tampa: "#27794f" };

export function visualDaCategoria(nome: string | null | undefined): VisualCategoria {
  return (nome && VISUAIS[normalizarTexto(nome)]) || PADRAO;
}

/** "Embalagem" ilustrada do medicamento, colorida pela categoria (sem fotos de produto). */
export function CaixaMedicamento({ categoria, nome, grande = false }: { categoria: string | null | undefined; nome: string; grande?: boolean }) {
  const v = visualDaCategoria(categoria);
  const Icone = v.icone;
  return (
    <div className={`grid place-items-center rounded-2xl ${grande ? "h-56" : "h-36"}`} style={{ background: v.fundo }} aria-hidden>
      <div className={`relative flex flex-col items-center ${grande ? "scale-125" : ""}`}>
        <div className="h-3 w-12 rounded-t-md" style={{ background: v.tampa }} />
        <div className="flex h-20 w-16 flex-col items-center justify-center gap-1 rounded-lg bg-white shadow-md ring-1 ring-black/5">
          <Icone className="size-5" style={{ color: v.tampa }} />
          <span className="line-clamp-2 px-1 text-center text-[8px] font-bold leading-tight text-tinta">{nome}</span>
        </div>
      </div>
    </div>
  );
}

const CORES_TIPO: Record<TipoMedicamento, string> = {
  referencia: "bg-marca-900 text-white",
  generico: "bg-menta-100 text-marca-800",
  similar: "bg-creme text-amber-800",
};

export function SeloTipo({ tipo }: { tipo: TipoMedicamento }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${CORES_TIPO[tipo]}`}>{ROTULO_TIPO[tipo]}</span>;
}
