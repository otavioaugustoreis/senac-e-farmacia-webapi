import Link from "next/link";
import { criarCasosAdmin } from "@/application/casos-de-uso/admin";
import { estaDesatualizado } from "@/domain/preco";
import { obterContainer } from "@/infrastructure/container";

export default async function AdminPage() {
  const { repos, usuarioAtual } = await obterContainer();
  const usuario = await usuarioAtual();
  const casos = criarCasosAdmin(repos);
  const [medicamentos, precos, farmacias, cupons, reportes] = await Promise.all([
    casos.listarMedicamentos(usuario), casos.listarPrecos(usuario), casos.listarFarmacias(usuario),
    casos.listarCupons(usuario), casos.listarReportes(usuario),
  ]);
  const hoje = new Date();
  const desatualizados = precos.filter((p) => estaDesatualizado(p, hoje)).length;
  const abertos = reportes.filter((r) => !r.resolvido).length;
  const atualizadosPct = precos.length ? Math.round(((precos.length - desatualizados) / precos.length) * 100) : 100;

  const cards = [
    { href: "/admin/medicamentos", valor: medicamentos.length, rotulo: "Medicamentos" },
    { href: "/admin/precos", valor: precos.length, rotulo: "Preços", extra: `${atualizadosPct}% atualizados em até 7 dias` },
    { href: "/admin/farmacias", valor: farmacias.length, rotulo: "Farmácias", extra: `${farmacias.filter((f) => f.parceira).length} parceiras` },
    { href: "/admin/cupons", valor: cupons.length, rotulo: "Cupons" },
    { href: "/admin/reportes", valor: abertos, rotulo: "Reportes abertos", destaque: abertos > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-marca-900">Painel</h1>
      <p className="text-sm text-suave">Olá, {usuario?.nome ?? usuario?.email}. Mantenha preços e dados em dia.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className={`rounded-[var(--radius-card)] p-5 ring-1 ring-black/5 hover:shadow-md ${c.destaque ? "bg-creme" : "bg-white"}`}>
            <p className="text-3xl font-bold text-marca-800">{c.valor}</p>
            <p className="text-sm font-medium">{c.rotulo}</p>
            {c.extra && <p className="mt-1 text-xs text-suave">{c.extra}</p>}
          </Link>
        ))}
      </div>
      {desatualizados > 0 && (
        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {desatualizados} {desatualizados === 1 ? "preço está" : "preços estão"} há mais de 7 dias sem atualização.{" "}
          <Link href="/admin/precos" className="font-semibold underline">Revisar preços</Link>
        </p>
      )}
    </div>
  );
}
