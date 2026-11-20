import { listarCuponsVigentes } from "@/application/casos-de-uso/listar-cupons-vigentes";
import { obterContainer } from "@/infrastructure/container";
import { json, tratar } from "../_http";

/** GET /api/cupons — somente vigentes */
export async function GET(_request: Request) {
  return tratar(async () => {
    const { repos } = await obterContainer();
    return json(await listarCuponsVigentes(repos)(new Date()));
  });
}
