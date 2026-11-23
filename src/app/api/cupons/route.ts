import { listActiveCoupons } from "@/application/casos-de-uso/listar-cupons-vigentes";
import { getContainer } from "@/infrastructure/container";
import { json, handle } from "../_http";

/** GET /api/cupons — somente vigentes */
export async function GET() {
  return handle(async () => {
    const { repos } = await getContainer();
    return json(await listActiveCoupons(repos)(new Date()));
  });
}
