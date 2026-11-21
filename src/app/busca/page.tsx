import type { Metadata } from "next";
import Link from "next/link";
import { buscarMedicamentos, listarCategorias } from "@/application/casos-de-uso/buscar-medicamentos";
import { obterContainer } from "@/infrastructure/container";
import { CartaoMedicamento } from "@/components/CartaoMedicamento";

export const metadata: Metadata = { title: "Buscar medicamentos — E-Farmácia" };

type Params = { q?: string; categoria?: string };

export default async function BuscaPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { q = "", categoria } = await searchParams;
  const categoriaId = Number(categoria);
  const filtro = Number.isInteger(categoriaId) && categoriaId > 0 ? categoriaId : undefined;

  const { repos } = await obterContainer();
  const [resultados, categorias] = await Promise.all([buscarMedicamentos(repos)(q, filtro), listarCategorias(repos)()]);
  const nomeCategoria = categorias.find((c) => c.id === filtro)?.nome;

  const link = (cat?: number) => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (cat) p.set("categoria", String(cat));
    const s = p.toString();
    return s ? `/busca?${s}` : "/busca";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-marca-900">
        {q.trim() ? <>Resultados para “{q.trim()}”</> : "Todos os medicamentos"}
        {nomeCategoria && <span className="font-serif font-normal italic text-suave"> em {nomeCategoria}</span>}
      </h1>
      <p className="text-sm text-suave">{resultados.length} {resultados.length === 1 ? "medicamento" : "medicamentos"}</p>

      <nav aria-label="Filtrar por categoria" className="sem-barra -mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip ativo={!filtro} href={link()}>Todas</Chip>
        {categorias.map((c) => (
          <Chip key={c.id} ativo={filtro === c.id} href={link(c.id)}>{c.nome}</Chip>
        ))}
      </nav>

      {resultados.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-card)] bg-white p-10 text-center ring-1 ring-black/5">
          <p className="text-lg font-semibold">Nenhum medicamento encontrado</p>
          <p className="mt-1 text-sm text-suave">Confira a grafia ou busque pelo princípio ativo (ex.: “paracetamol”).</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5 xl:grid-cols-5">
          {resultados.map((m) => <CartaoMedicamento key={m.id} medicamento={m} />)}
        </div>
      )}
    </div>
  );
}

function Chip({ ativo, href, children }: { ativo: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={ativo ? "page" : undefined}
      className={`flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-medium ring-1 ${ativo ? "bg-marca-800 text-white ring-marca-800" : "bg-white text-tinta ring-black/10 hover:ring-marca-600"}`}>
      {children}
    </Link>
  );
}
