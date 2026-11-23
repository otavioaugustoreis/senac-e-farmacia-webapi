import {
  Activity, Droplet, Flower2, HeartPulse, Pill, ShieldPlus, Stethoscope, Sun, Thermometer, type LucideIcon,
} from "lucide-react";
import { TYPE_LABELS, type MedicineType } from "@/domain/medicamento";
import { normalizeText } from "@/domain/texto";

interface CategoryVisual {
  icone: LucideIcon;
  subtitle: string;
  background: string;
  cap: string;
}

const VISUALS: Record<string, CategoryVisual> = {
  "analgesicos e antitermicos": { icone: Thermometer, subtitle: "Dor e febre", background: "#fde8d7", cap: "#e8743b" },
  "anti-inflamatorios": { icone: Activity, subtitle: "Inflamação", background: "#fbe3e8", cap: "#d1495b" },
  antibiotics: { icone: ShieldPlus, subtitle: "Infecções", background: "#e0ecfb", cap: "#3a6fc4" },
  "anti-hipertensivos": { icone: HeartPulse, subtitle: "Pressão arterial", background: "#ece4fb", cap: "#7650c9" },
  gastrointestinal: { icone: Stethoscope, subtitle: "Estômago", background: "#fdf3d2", cap: "#c99a1a" },
  antiallergics: { icone: Flower2, subtitle: "Alergias", background: "#e3f5ee", cap: "#2f9a72" },
  diabetes: { icone: Droplet, subtitle: "Glicose", background: "#dff3f7", cap: "#2391a8" },
  vitamins: { icone: Sun, subtitle: "Suplementos", background: "#fff1d6", cap: "#e0a100" },
};

const DEFAULT: CategoryVisual = { icone: Pill, subtitle: "Medicamentos", background: "#e9f6ee", cap: "#27794f" };

export function categoryVisual(name: string | null | undefined): CategoryVisual {
  return (name && VISUALS[normalizeText(name)]) || DEFAULT;
}

/** "Embalagem" ilustrada do medicamento, colorida pela categoria (sem fotos de produto). */
export function MedicineBox({ category, name, large = false, neutral = false }: {
  category: string | null | undefined; name: string; large?: boolean; neutral?: boolean;
}) {
  const v = categoryVisual(category);
  const Icone = v.icone;
  return (
    <div className={`grid place-items-center rounded-2xl ${large ? "h-56" : "h-36 sm:h-44"}`} style={{ background: neutral ? "transparent" : v.background }} aria-hidden>
      <div className={`relative flex flex-col items-center ${large ? "scale-125" : neutral ? "scale-[1.3] sm:scale-150" : ""}`}>
        <div className="h-3 w-12 rounded-t-md" style={{ background: v.cap }} />
        <div className="flex h-20 w-16 flex-col items-center justify-center gap-1 rounded-lg bg-white shadow-md ring-1 ring-black/5">
          <Icone className="size-5" style={{ color: v.cap }} />
          <span className="line-clamp-2 px-1 text-center text-[8px] font-bold leading-tight text-tinta">{name}</span>
        </div>
      </div>
    </div>
  );
}

const TYPE_COLORS: Record<MedicineType, string> = {
  referencia: "bg-marca-900 text-white",
  generico: "bg-menta-100 text-marca-800",
  similar: "bg-creme text-amber-800",
};

export function TypeBadge({ type }: { type: MedicineType }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TYPE_COLORS[type]}`}>{TYPE_LABELS[type]}</span>;
}
