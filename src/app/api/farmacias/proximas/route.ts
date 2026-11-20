import { farmaciasProximas } from "@/application/casos-de-uso/farmacias-proximas";
import { obterContainer } from "@/infrastructure/container";
import { json, tratar } from "../../_http";

const numeroOuNada = (v: string | null) => (v === null || v.trim() === "" ? undefined : Number(v));

/** GET /api/farmacias/proximas?lat=&lng= — sem posição válida usa a Av. Paulista */
export async function GET(request: Request) {
  return tratar(async () => {
    const { searchParams } = new URL(request.url);
    const { repos } = await obterContainer();
    return json(await farmaciasProximas(repos)(numeroOuNada(searchParams.get("lat")), numeroOuNada(searchParams.get("lng"))));
  });
}
