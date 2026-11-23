import type { Metadata } from "next";
import { PharmacyMapClient } from "@/components/PharmacyMapClient";

export const metadata: Metadata = { title: "Farmácias próximas — E-Farmácia" };

export default function PharmaciesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Farmácias perto de você</h1>
      <p className="mb-4 text-sm text-muted">
        Permita o acesso à localização para ver as farmácias mais próximas. Em <span className="font-semibold text-amber-700">laranja</span>, as parceiras com cupom.
      </p>
      <PharmacyMapClient />
    </div>
  );
}
