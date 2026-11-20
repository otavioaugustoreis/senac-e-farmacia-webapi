import { buscarMedicamentos } from "@/application/casos-de-uso/buscar-medicamentos";
import { obterContainer } from "@/infrastructure/container";
import { json, tratar } from "../_http";

/** GET /api/medicamentos?q=&categoria= */
export async function GET(request: Request) {
  return tratar(async () => {
    const { searchParams } = new URL(request.url);
    const categoria = Number(searchParams.get("categoria"));
    const { repos } = await obterContainer();
    const resultado = await buscarMedicamentos(repos)(searchParams.get("q") ?? "", Number.isInteger(categoria) && categoria > 0 ? categoria : undefined);
    return json(resultado);
  });
}
