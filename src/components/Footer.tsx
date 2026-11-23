import Link from "next/link";
import { ArrowRight, ArrowUp, ExternalLink, MapPin, Phone, Search, ShieldAlert } from "lucide-react";
import { ANVISA_INSERTS_LINK, CMED_LINK } from "@/lib/links";
import { Logo } from "./Logo";

export const HEALTH_NOTICE = "O E-Farmácia informa, não substitui a orientação de médico ou farmacêutico.";

const EMERGENCY_CONTACTS = [
  { name: "SAMU", detail: "Urgência médica", phoneDisplay: "192", tel: "192" },
  { name: "Disque-Intoxicação", detail: "Anvisa · 24 horas", phoneDisplay: "0800 722 6001", tel: "08007226001" },
];

const EXPLORE_LINKS = [
  { href: "/busca", label: "Buscar medicamentos" },
  { href: "/farmacias", label: "Farmácias próximas" },
  { href: "/cupons", label: "Cupons de desconto" },
];

const title = "text-xs font-semibold uppercase tracking-wider text-white/55";
const link = "inline-flex items-center gap-1.5 rounded py-1.5 text-white/85 transition hover:text-white focus-visible:outline-2 focus-visible:outline-white";

export function Footer() {
  return (
    <footer className="mb-4 mt-10 overflow-hidden rounded-[var(--radius-card)] bg-marca-900 text-white">
      {/* Marca + atalhos principais */}
      <div className="flex flex-col gap-5 border-b border-white/10 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Logo light />
          <p className="mt-2 max-w-sm text-sm text-white/70">Bula organizada, preços comparados e farmácias perto de você, num só lugar.</p>
        </div>
        <div className="hidden flex-wrap gap-3 md:flex">
          <Link href="/busca" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-marca-900 transition hover:bg-menta-100">
            <Search className="size-4" aria-hidden /> Buscar medicamento
          </Link>
          <Link href="/farmacias" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-white/30 transition hover:bg-white/10">
            <MapPin className="size-4" aria-hidden /> Farmácias perto de mim
          </Link>
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1fr_1.3fr]">
        {/* No celular a barra inferior já faz esse papel. */}
        <nav aria-label="Explorar" className="hidden md:block">
          <h2 className={title}>Explorar</h2>
          <ul className="mt-3 text-sm">
            {EXPLORE_LINKS.map((i) => (
              <li key={i.href}><Link href={i.href} className={link}>{i.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={title}>Fontes oficiais</h2>
          <ul className="mt-3 text-sm">
            <li>
              <a href={ANVISA_INSERTS_LINK} target="_blank" rel="noreferrer" className={link}>
                Bulário Eletrônico da Anvisa <ExternalLink className="size-3.5 opacity-70" aria-hidden />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </li>
            <li>
              <a href={CMED_LINK} target="_blank" rel="noreferrer" className={link}>
                Preços de referência CMED <ExternalLink className="size-3.5 opacity-70" aria-hidden />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </li>
            <li><Link href="/creditos" className={link}>Créditos das imagens</Link></li>
          </ul>
        </div>

        <section aria-labelledby="titulo-emergencia">
          <h2 id="titulo-emergencia" className={title}>Em caso de emergência</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-1 2xl:grid-cols-2">
            {EMERGENCY_CONTACTS.map((e) => (
              <li key={e.name}>
                <a href={`tel:${e.tel}`} className="group flex items-center gap-3 rounded-2xl bg-white/10 p-3 transition hover:bg-white/15">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-marca-800">
                    <Phone className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-bold leading-tight">{e.phoneDisplay}</span>
                    <span className="block text-xs text-white/70">{e.name} · {e.detail}</span>
                  </span>
                  <ArrowRight className="ml-auto size-4 shrink-0 opacity-0 transition group-hover:opacity-70" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mx-6 flex items-start gap-3 rounded-2xl bg-alerta/15 p-4 sm:mx-8">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-alerta" aria-hidden />
        <p className="text-sm leading-snug text-white/90">
          <strong className="font-semibold text-white">{HEALTH_NOTICE}</strong>{" "}
          Antes de trocar um medicamento por genérico ou similar, confirme com um profissional.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-white/10 px-6 py-4 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} E-Farmácia · Projeto Integrador I — Senac · Preços, farmácias e cupons são dados de demonstração.</p>
        <a href="#topo" className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-white/80 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white">
          Voltar ao topo <ArrowUp className="size-3.5" aria-hidden />
        </a>
      </div>
    </footer>
  );
}
