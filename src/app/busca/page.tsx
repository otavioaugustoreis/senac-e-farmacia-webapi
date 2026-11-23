import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchMedicines, listCategories } from "@/application/casos-de-uso/buscar-medicamentos";
import { getContainer } from "@/infrastructure/container";
import { MedicineCard } from "@/components/CartaoMedicamento";

export const metadata: Metadata = { title: "Buscar medicamentos — E-Farmácia" };

type Params = { q?: string; category?: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { q = "", category } = await searchParams;
  const categoryId = Number(category);
  const filter = Number.isInteger(categoryId) && categoryId > 0 ? categoryId : undefined;

  const { repos } = await getContainer();
  const [results, categories] = await Promise.all([searchMedicines(repos)(q, filter), listCategories(repos)()]);
  const categoryName = categories.find((c) => c.id === filter)?.name;

  const link = (cat?: number) => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (cat) p.set("categoria", String(cat));
    const s = p.toString();
    return s ? `/busca?${s}` : "/busca";
  };

  return (
    <div>
      {/* No celular a busca mora aqui (aba "Buscar"); no computador fica no cabeçalho. */}
      <form action="/busca" role="search" autoComplete="off" className="mb-5 md:hidden">
        {filter && <input type="hidden" name="categoria" value={filter} />}
        <label className="flex items-center gap-2 rounded-full bg-white px-4 ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-marca-600">
          <Search className="size-4 shrink-0 text-suave" aria-hidden />
          <input data-anel-externo key={q} name="q" type="search" enterKeyHint="search" defaultValue={q} placeholder="Nome ou princípio ativo"
            aria-label="Buscar medicamento" className="h-12 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-suave" />
        </label>
      </form>
      <h1 className="text-2xl font-bold text-marca-900">
        {q.trim() ? <>Resultados para “{q.trim()}”</> : "Todos os medicamentos"}
        {categoryName && <span className="font-serif font-normal italic text-suave"> em {categoryName}</span>}
      </h1>
      <p className="text-sm text-suave">{results.length} {results.length === 1 ? "medicamento" : "medicamentos"}</p>

      <nav aria-label="Filtrar por categoria" className="sem-barra -mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip isActive={!filter} href={link()}>Todas</Chip>
        {categories.map((c) => (
          <Chip key={c.id} isActive={filter === c.id} href={link(c.id)}>{c.name}</Chip>
        ))}
      </nav>

      {results.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-card)] bg-white p-10 text-center ring-1 ring-black/5">
          <p className="text-lg font-semibold">Nenhum medicamento encontrado</p>
          <p className="mt-1 text-sm text-suave">Confira a grafia ou busque pelo princípio ativo (ex.: “paracetamol”).</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5 xl:grid-cols-5">
          {results.map((m) => <MedicineCard key={m.id} medicine={m} />)}
        </div>
      )}
    </div>
  );
}

function Chip({ isActive, href, children }: { isActive: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={isActive ? "page" : undefined}
      className={`flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-medium ring-1 ${isActive ? "bg-marca-800 text-white ring-marca-800" : "bg-white text-tinta ring-black/10 hover:ring-marca-600"}`}>
      {children}
    </Link>
  );
}
