import type { Metadata } from "next";
import Link from "next/link";
import { buscarMedicamentos } from "@/application/casos-de-uso/buscar-medicamentos";
import { obterContainer } from "@/infrastructure/container";
import { FotoMedicamento } from "@/components/FotoMedicamento";

export const metadata: Metadata = { title: "Créditos das imagens — E-Farmácia" };

export default async function CreditosPage() {
  const { repos } = await obterContainer();
  const comFoto = (await buscarMedicamentos(repos)("")).filter((m) => m.imagem);

  return (
    <div>
      <h1 className="text-2xl font-bold text-marca-900 sm:text-3xl">Créditos das imagens</h1>
      <p className="mt-2 max-w-3xl text-sm text-suave">
        As fotos dos medicamentos vêm da Wikimedia Commons, com licenças livres (domínio público, CC0, CC BY e CC BY-SA),
        e são usadas sem alterações. São imagens ilustrativas e podem diferir da embalagem vendida no Brasil.
        Medicamentos sem foto livre disponível aparecem com ilustração.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {comFoto.map((m) => (
          <li key={m.id} className="flex gap-3 rounded-2xl p-3 ring-1 ring-black/5">
            <div className="w-28 shrink-0"><FotoMedicamento medicamento={m} /></div>
            <div className="min-w-0 text-sm">
              <Link href={`/medicamento/${m.id}`} className="font-semibold hover:underline">{m.nomeComercial}</Link>
              <p className="mt-1 text-xs text-suave">{m.imagem!.credito}</p>
              <a href={m.imagem!.fonte} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-marca-700 underline">
                Ver original e licença
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
