import { BULARIO_LINK, CMED_LINK } from "@/lib/links";
import { Logo } from "./Logo";

export const AVISO_SAUDE = "O E-Farmácia informa, não substitui a orientação de médico ou farmacêutico.";

export function Footer() {
  return (
    <footer className="mb-4 rounded-[var(--radius-card)] bg-marca-900 px-6 py-8 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Logo claro />
        <p className="text-sm font-semibold">{AVISO_SAUDE}</p>
      </div>
      <p className="mt-4 text-xs text-white/70">
        Bulas: <a className="underline" href={BULARIO_LINK} target="_blank" rel="noreferrer">Bulário Eletrônico da Anvisa</a> ·
        Preços de referência: <a className="underline" href={CMED_LINK} target="_blank" rel="noreferrer">CMED/Anvisa</a> ·
        Preços e cupons exibidos são dados de demonstração.
      </p>
    </footer>
  );
}
