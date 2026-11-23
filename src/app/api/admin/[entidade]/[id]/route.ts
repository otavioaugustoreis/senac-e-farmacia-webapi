import { json, parseId, noContent, handle, type RouteContext } from "../../../_http";
import { requireOperation, prepareAdmin } from "../../_entidades";

type Params = RouteContext<{ entity: string; id: string }>;

/** GET /api/admin/:entidade/:id — detalhe extra (ex.: bula do medicamento) */
export async function GET(_request: Request, { params }: Params) {
  return handle(async () => {
    const p = await params;
    const { ops, user } = await prepareAdmin(p.entity);
    return json(await requireOperation(ops.get)(user, parseId(p.id)));
  });
}

/** DELETE /api/admin/:entidade/:id */
export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const p = await params;
    const { ops, user } = await prepareAdmin(p.entity);
    await requireOperation(ops.remove)(user, parseId(p.id));
    return noContent();
  });
}

/** PATCH /api/admin/reportes/:id — marca o reporte como resolvido */
export async function PATCH(_request: Request, { params }: Params) {
  return handle(async () => {
    const p = await params;
    const { ops, user } = await prepareAdmin(p.entity);
    await requireOperation(ops.markResolved)(user, parseId(p.id));
    return noContent();
  });
}
