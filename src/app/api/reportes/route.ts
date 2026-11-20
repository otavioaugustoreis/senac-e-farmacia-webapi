import { reportarPreco } from "@/application/casos-de-uso/reportar-preco";
import { obterContainer } from "@/infrastructure/container";
import { json, lerJson, tratar } from "../_http";

/** POST /api/reportes { precoId, comentario } — exige login */
export async function POST(request: Request) {
  return tratar(async () => {
    const { repos, usuarioAtual } = await obterContainer();
    const usuario = await usuarioAtual();
    const corpo = usuario ? await lerJson(request) : {};
    await reportarPreco(repos)(usuario, Number(corpo.precoId), String(corpo.comentario ?? ""));
    return json({ ok: true }, 201);
  });
}
