/** Aparece na hora em que a pessoa navega, enquanto a página busca os dados. */
export default function Carregando() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse space-y-6">
      <span className="sr-only">Carregando…</span>
      <div className="h-8 w-2/3 max-w-md rounded-full bg-menta-100" />
      <div className="h-4 w-1/2 max-w-sm rounded-full bg-black/5" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-36 rounded-2xl bg-black/5 sm:h-44" />
            <div className="h-4 w-3/4 rounded-full bg-black/5" />
            <div className="h-4 w-1/3 rounded-full bg-menta-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
