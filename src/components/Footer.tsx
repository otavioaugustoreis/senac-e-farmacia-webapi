import Link from "next/link";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { BULARIO_LINK, CMED_LINK } from "@/lib/links";
import { Logo } from "./Logo";

export const AVISO_SAUDE = "O E-Farmácia informa, não substitui a orientação de médico ou farmacêutico.";

export function Footer() {
  return (
    <footer className="mb-4 mt-6 rounded-[var(--radius-card)] bg-marca-900 p-6 text-white sm:p-8">
      <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-alerta" aria-hidden />
        <p className="text-sm font-semibold leading-snug sm:text-base">{AVISO_SAUDE}</p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div>
          <Logo claro />
          <p className="mt-2 text-sm text-white/70">Bula, preços e farmácias próximas num só lugar.</p>
        </div>
        <nav aria-label="Rodapé">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white/60">Navegação</h2>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 text-sm sm:grid-cols-1">
            <li><Link href="/busca" className="inline-block py-1.5 hover:underline">Buscar medicamentos</Link></li>
            <li><Link href="/farmacias" className="inline-block py-1.5 hover:underline">Farmácias próximas</Link></li>
            <li><Link href="/cupons" className="inline-block py-1.5 hover:underline">Cupons</Link></li>
            <li><Link href="/entrar" className="inline-block py-1.5 hover:underline">Entrar</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white/60">Fontes oficiais</h2>
          <ul className="mt-2 text-sm">
            <li>
              <a href={BULARIO_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 py-1.5 hover:underline">
                Bulário Eletrônico da Anvisa <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </li>
            <li>
              <a href={CMED_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 py-1.5 hover:underline">
                Preços de referência CMED <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
        Preços, farmácias e cupons exibidos são dados de demonstração · Projeto Integrador I — Senac
      </p>
    </footer>
  );
}
