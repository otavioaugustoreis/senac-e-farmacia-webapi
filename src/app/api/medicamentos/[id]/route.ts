import { detalharMedicamento } from "@/application/casos-de-uso/detalhar-medicamento";
import { obterContainer } from "@/infrastructure/container";
import { json, lerId, tratar, type Contexto } from "../../_http";

/** GET /api/medicamentos/:id — bula, preços, alternativas e cupons */
export async function GET(_request: Request, { params }: Contexto<{ id: string }>) {
  return tratar(async () => {
    const id = lerId((await params).id);
    const { repos } = await obterContainer();
    return json(await detalharMedicamento(repos)(id, new Date()));
  });
}
