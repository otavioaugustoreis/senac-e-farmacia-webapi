import type { Metadata } from "next";
import Link from "next/link";
import { searchMedicines } from "@/application/casos-de-uso/buscar-medicamentos";
import { getContainer } from "@/infrastructure/container";
import { MedicineImage } from "@/components/FotoMedicamento";

export const metadata: Metadata = { title: "Créditos das imagens — E-Farmácia" };

export default async function CreditsPage() {
  const { repos } = await getContainer();
  const withImage = (await searchMedicines(repos)("")).filter((m) => m.image);

  return (
    <div>
      <h1 className="text-2xl font-bold text-marca-900 sm:text-3xl">Créditos das imagens</h1>
      <p className="mt-2 max-w-3xl text-sm text-suave">
        As imagens dos medicamentos são ilustrativas e podem diferir da embalagem real. Abaixo, o crédito de cada uma.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {withImage.map((m) => (
          <li key={m.id} className="flex gap-3 rounded-2xl p-3 ring-1 ring-black/5">
            <div className="w-28 shrink-0"><MedicineImage medicine={m} /></div>
            <div className="min-w-0 text-sm">
              <Link href={`/medicamento/${m.id}`} className="font-semibold hover:underline">{m.brandName}</Link>
              <p className="mt-1 text-xs text-suave">{m.image!.credit}</p>
              {m.image!.source.startsWith("https://") && (
                <a href={m.image!.source} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-marca-700 underline">
                  Ver original e licença
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
