import { listCategories } from "@/application/casos-de-uso/buscar-medicamentos";
import { getContainer } from "@/infrastructure/container";
import { json, handle } from "../_http";

/** GET /api/categorias */
export async function GET() {
  return handle(async () => {
    const { repos } = await getContainer();
    return json(await listCategories(repos)());
  });
}
