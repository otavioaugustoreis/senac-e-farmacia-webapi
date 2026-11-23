import { reportPrice } from "@/application/use-cases/report-price";
import { getContainer } from "@/infrastructure/container";
import { json, readJson, handle } from "../_http";

/** POST /api/reportes { precoId, comentario } — exige login */
export async function POST(request: Request) {
  return handle(async () => {
    const { repos, currentUser } = await getContainer();
    const user = await currentUser();
    const body = user ? await readJson(request) : {};
    await reportPrice(repos)(user, Number(body.priceId), String(body.comment ?? ""));
    return json({ ok: true }, 201);
  });
}
