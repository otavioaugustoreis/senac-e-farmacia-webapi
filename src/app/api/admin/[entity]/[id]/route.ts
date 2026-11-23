import { json, parseId, noContent, handle, type RouteContext } from "../../../_http";
import { requireOperation, prepareAdmin } from "../../_entities";

type Params = RouteContext<{ entity: string; id: string }>;

export async function GET(_request: Request, { params }: Params) {
  return handle(async () => {
    const p = await params;
    const { ops, user } = await prepareAdmin(p.entity);
    return json(await requireOperation(ops.get)(user, parseId(p.id)));
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const p = await params;
    const { ops, user } = await prepareAdmin(p.entity);
    await requireOperation(ops.remove)(user, parseId(p.id));
    return noContent();
  });
}

export async function PATCH(_request: Request, { params }: Params) {
  return handle(async () => {
    const p = await params;
    const { ops, user } = await prepareAdmin(p.entity);
    await requireOperation(ops.markResolved)(user, parseId(p.id));
    return noContent();
  });
}
