import type { Metadata } from "next";
import { MapaFarmaciasCliente } from "@/components/MapaFarmaciasCliente";

export const metadata: Metadata = { title: "Farmácias próximas — E-Farmácia" };

export default function FarmaciasPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-marca-900">Farmácias perto de você</h1>
      <p className="mb-4 text-sm text-suave">
        Permita o acesso à localização para ver as farmácias mais próximas. Em <span className="font-semibold text-amber-700">laranja</span>, as parceiras com cupom.
      </p>
      <MapaFarmaciasCliente />
    </div>
  );
}
