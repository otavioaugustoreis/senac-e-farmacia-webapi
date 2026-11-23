import { json, readJson, handle, type RouteContext } from "../../_http";
import { requireOperation, prepareAdmin } from "../_entidades";

type Params = RouteContext<{ entity: string }>;

/** GET /api/admin/:entidade — lista (somente admin) */
export async function GET(_request: Request, { params }: Params) {
  return handle(async () => {
    const { ops, user } = await prepareAdmin((await params).entity);
    return json(await ops.list(user));
  });
}

/** POST /api/admin/:entidade — cria ou atualiza (id opcional no corpo) */
export async function POST(request: Request, { params }: Params) {
  return handle(async () => {
    const { ops, user } = await prepareAdmin((await params).entity);
    const save = requireOperation(ops.save);
    return json((await save(user, await readJson(request))) ?? { ok: true });
  });
}
