import { nearbyPharmacies } from "@/application/casos-de-uso/farmacias-proximas";
import { getContainer } from "@/infrastructure/container";
import { json, handle } from "../../_http";

const numberOrNull = (v: string | null) => (v === null || v.trim() === "" ? undefined : Number(v));

/** GET /api/farmacias/proximas?lat=&lng= — sem posição válida usa a Av. Paulista */
export async function GET(request: Request) {
  return handle(async () => {
    const { searchParams } = new URL(request.url);
    const { repos } = await getContainer();
    return json(await nearbyPharmacies(repos)(numberOrNull(searchParams.get("lat")), numberOrNull(searchParams.get("lng"))));
  });
}
