import { json, lerJson, tratar, type Contexto } from "../../_http";
import { exigirOperacao, prepararAdmin } from "../_entidades";

type Params = Contexto<{ entidade: string }>;

/** GET /api/admin/:entidade — lista (somente admin) */
export async function GET(_request: Request, { params }: Params) {
  return tratar(async () => {
    const { ops, usuario } = await prepararAdmin((await params).entidade);
    return json(await ops.listar(usuario));
  });
}

/** POST /api/admin/:entidade — cria ou atualiza (id opcional no corpo) */
export async function POST(request: Request, { params }: Params) {
  return tratar(async () => {
    const { ops, usuario } = await prepararAdmin((await params).entidade);
    const salvar = exigirOperacao(ops.salvar);
    const corpo = usuario?.role === "admin" ? await lerJson(request) : {};
    return json((await salvar(usuario, corpo)) ?? { ok: true });
  });
}
