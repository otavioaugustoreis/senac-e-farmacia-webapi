import { listCategories } from "@/application/use-cases/search-medicines";
import { getContainer } from "@/infrastructure/container";
import { json, handle } from "../_http";

export async function GET() {
  return handle(async () => {
    const { repos } = await getContainer();
    return json(await listCategories(repos)());
  });
}
