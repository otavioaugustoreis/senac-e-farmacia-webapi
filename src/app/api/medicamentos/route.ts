import { searchMedicines } from "@/application/use-cases/search-medicines";
import { getContainer } from "@/infrastructure/container";
import { json, handle } from "../_http";

/** GET /api/medicamentos?q=&categoria= */
export async function GET(request: Request) {
  return handle(async () => {
    const { searchParams } = new URL(request.url);
    const category = Number(searchParams.get("categoria"));
    const { repos } = await getContainer();
    const result = await searchMedicines(repos)(searchParams.get("q") ?? "", Number.isInteger(category) && category > 0 ? category : undefined);
    return json(result);
  });
}
