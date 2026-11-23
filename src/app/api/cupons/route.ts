import { listActiveCoupons } from "@/application/use-cases/list-active-coupons";
import { getContainer } from "@/infrastructure/container";
import { json, handle } from "../_http";

export async function GET() {
  return handle(async () => {
    const { repos } = await getContainer();
    return json(await listActiveCoupons(repos)(new Date()));
  });
}
