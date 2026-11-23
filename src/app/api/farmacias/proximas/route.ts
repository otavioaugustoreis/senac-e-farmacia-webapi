import { nearbyPharmacies } from "@/application/use-cases/nearby-pharmacies";
import { getContainer } from "@/infrastructure/container";
import { json, handle } from "../../_http";

const numberOrNull = (v: string | null) => (v === null || v.trim() === "" ? undefined : Number(v));

export async function GET(request: Request) {
  return handle(async () => {
    const { searchParams } = new URL(request.url);
    const { repos } = await getContainer();
    return json(await nearbyPharmacies(repos)(numberOrNull(searchParams.get("lat")), numberOrNull(searchParams.get("lng"))));
  });
}
