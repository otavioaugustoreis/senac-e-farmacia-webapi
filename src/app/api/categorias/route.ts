import { listarCategorias } from "@/application/casos-de-uso/buscar-medicamentos";
import { obterContainer } from "@/infrastructure/container";
import { json, tratar } from "../_http";

/** GET /api/categorias */
export async function GET() {
  return tratar(async () => {
    const { repos } = await obterContainer();
    return json(await listarCategorias(repos)());
  });
}
