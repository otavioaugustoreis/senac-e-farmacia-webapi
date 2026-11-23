import { getMedicineDetail } from "@/application/use-cases/get-medicine-detail";
import { getContainer } from "@/infrastructure/container";
import { json, parseId, handle, type RouteContext } from "../../_http";

/** GET /api/medicamentos/:id — bula, preços, alternativas e cupons */
export async function GET(_request: Request, { params }: RouteContext<{ id: string }>) {
  return handle(async () => {
    const id = parseId((await params).id);
    const { repos } = await getContainer();
    return json(await getMedicineDetail(repos)(id, new Date()));
  });
}
