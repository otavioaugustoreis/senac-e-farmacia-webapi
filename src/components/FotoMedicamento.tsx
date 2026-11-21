import Image from "next/image";
import type { Medicamento } from "@/domain/medicamento";
import { CaixaMedicamento } from "./visual";

interface Props {
  medicamento: Pick<Medicamento, "nomeComercial" | "categoria" | "imagem">;
  /** "cartao": vitrine; "destaque": página do medicamento */
  variante?: "cartao" | "destaque";
}

const TAMANHOS = { cartao: "(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw", destaque: "(min-width: 768px) 320px, 100vw" };

/** Foto real (licença livre) quando houver; senão, a ilustração da embalagem. */
export function FotoMedicamento({ medicamento: m, variante = "cartao" }: Props) {
  const altura = variante === "destaque" ? "h-56 md:h-72" : "h-36 sm:h-44";
  if (!m.imagem) {
    return <CaixaMedicamento categoria={m.categoria?.nome} nome={m.nomeComercial} neutro={variante === "cartao"} grande={variante === "destaque"} />;
  }
  // Ilustrações SVG da equipe aparecem inteiras (sem corte) e sem otimização de imagem.
  const ilustracao = m.imagem.url.endsWith(".svg");
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl ${ilustracao ? "bg-white ring-1 ring-black/5" : "bg-[#f3f5f4]"} ${altura}`}>
      <Image src={m.imagem.url} alt={`Imagem ilustrativa de ${m.nomeComercial}`} fill sizes={TAMANHOS[variante]}
        unoptimized={ilustracao}
        className={`${ilustracao ? "object-contain p-3" : "object-cover"} transition duration-300 group-hover:scale-105`} />
    </div>
  );
}
