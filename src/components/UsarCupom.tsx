"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CalendarClock, MapPin, Navigation, QrCode, X } from "lucide-react";
import { CopiarCodigo } from "./CopiarCodigo";

export interface CupomTela {
  codigo: string;
  desconto: string;
  descricao: string;
  validade: string; // já formatada (dd/mm/aaaa)
  farmacia: { nome: string; endereco: string };
}

/** Botão "Usar na farmácia": abre o cupom com QR code para o caixa escanear. */
export function UsarCupom({ cupom: c, compacto = false }: { cupom: CupomTela; compacto?: boolean }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const fechar = () => dialogo.current?.close();
  const rota = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${c.farmacia.nome}, ${c.farmacia.endereco}`)}`;

  return (
    <>
      <button type="button" onClick={() => dialogo.current?.showModal()}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-marca-800 font-semibold text-white transition hover:bg-marca-900 ${compacto ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"}`}>
        <QrCode className={compacto ? "size-3.5" : "size-4"} aria-hidden /> Usar na farmácia
      </button>

      <dialog ref={dialogo} aria-label={`Cupom ${c.codigo} da ${c.farmacia.nome}`}
        onClick={(e) => e.target === dialogo.current && fechar()}
        className="mx-auto mb-0 mt-auto w-full max-w-md rounded-t-[1.75rem] bg-white p-0 text-tinta shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-[2px] sm:mb-auto sm:rounded-[1.75rem]">
        <div className="relative px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
          <button type="button" onClick={fechar} aria-label="Fechar"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black/5 text-suave hover:bg-black/10">
            <X className="size-4" aria-hidden />
          </button>

          <p className="pr-10 text-xs font-semibold uppercase tracking-wide text-suave">{c.farmacia.nome}</p>
          <p className="mt-1 text-2xl font-bold text-marca-900">{c.desconto} de desconto</p>
          <p className="text-sm text-suave">{c.descricao}</p>

          <div className="mt-5 rounded-3xl bg-menta-50 p-5 text-center ring-1 ring-marca-600/10">
            <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-sm">
              <QRCodeSVG value={c.codigo} size={184} level="M" fgColor="#114029" title={`QR code do cupom ${c.codigo}`} />
            </div>
            <p className="mt-3 font-mono text-2xl font-bold tracking-[0.2em] text-marca-900">{c.codigo}</p>
            <p className="mt-1 text-sm text-tinta/80">
              Mostre esta tela no caixa. O atendente escaneia o QR code ou digita o código.
            </p>
          </div>

          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-suave">
              <CalendarClock className="size-4 shrink-0 text-marca-700" aria-hidden /> Válido até {c.validade}
            </li>
            {c.farmacia.endereco && (
              <li className="flex items-start gap-2 text-suave">
                <MapPin className="mt-0.5 size-4 shrink-0 text-marca-700" aria-hidden /> {c.farmacia.endereco}
              </li>
            )}
          </ul>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <a href={rota} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-marca-800 px-4 py-3 text-sm font-semibold text-white hover:bg-marca-900">
              <Navigation className="size-4" aria-hidden /> Como chegar
              <span className="sr-only">(abre o Google Maps)</span>
            </a>
            <CopiarCodigo codigo={c.codigo} rotulo="Copiar código" />
          </div>
          <p className="mt-2 text-center text-xs text-suave">Comprando online? Copie o código e cole no site da farmácia.</p>
        </div>
      </dialog>
    </>
  );
}
