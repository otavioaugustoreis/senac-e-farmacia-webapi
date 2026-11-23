import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-[var(--radius-card)] bg-white p-10 text-center ring-1 ring-black/5">
      <p className="text-5xl font-bold text-brand-700">404</p>
      <h1 className="mt-2 text-xl font-semibold">Página não encontrada</h1>
      <p className="mt-1 text-sm text-muted">O medicamento ou a página que você procura não existe.</p>
      <Link href="/busca" className="mt-6 inline-block rounded-full bg-brand-800 px-5 py-2 font-semibold text-white">Buscar medicamentos</Link>
    </div>
  );
}
