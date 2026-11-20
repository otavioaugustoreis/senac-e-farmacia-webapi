import { notFound } from "next/navigation";
import { GerenciadorEntidade } from "@/components/admin/GerenciadorEntidade";
import { ENTIDADES, type Entidade } from "@/components/admin/entidades";

export default async function EntidadePage({ params }: { params: Promise<{ entidade: string }> }) {
  const { entidade } = await params;
  if (!ENTIDADES.includes(entidade as Entidade)) notFound();
  return <GerenciadorEntidade entidade={entidade as Entidade} />;
}
