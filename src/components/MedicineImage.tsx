import Image from "next/image";
import type { Medicine } from "@/domain/medicine";
import { MedicineBox } from "./visual";

interface Props {
  medicine: Pick<Medicine, "brandName" | "category" | "image">;
  /** "card": vitrine; "featured": página do medicamento */
  variant?: "card" | "featured";
}

const SIZES = { card: "(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw", featured: "(min-width: 768px) 320px, 100vw" };

/** Foto real (licença livre) quando houver; senão, a ilustração da embalagem. */
export function MedicineImage({ medicine: m, variant = "card" }: Props) {
  const height = variant === "featured" ? "h-56 md:h-72" : "h-36 sm:h-44";
  if (!m.image) {
    return <MedicineBox category={m.category?.name} name={m.brandName} neutral={variant === "card"} large={variant === "featured"} />;
  }
  // Ilustrações SVG da equipe aparecem inteiras (sem corte) e sem otimização de imagem.
  const isIllustration = m.image.url.endsWith(".svg");
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl ${isIllustration ? "bg-white ring-1 ring-black/5" : "bg-[#f3f5f4]"} ${height}`}>
      <Image src={m.image.url} alt={`Imagem ilustrativa de ${m.brandName}`} fill sizes={SIZES[variant]}
        unoptimized={isIllustration}
        className={`${isIllustration ? "object-contain p-3" : "object-cover"} transition duration-300 group-hover:scale-105`} />
    </div>
  );
}
