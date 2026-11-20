import { json, lerId, semConteudo, tratar, type Contexto } from "../../../_http";
import { exigirOperacao, prepararAdmin } from "../../_entidades";

type Params = Contexto<{ entidade: string; id: string }>;

/** GET /api/admin/:entidade/:id — detalhe extra (ex.: bula do medicamento) */
export async function GET(_request: Request, { params }: Params) {
  return tratar(async () => {
    const p = await params;
    const { ops, usuario } = await prepararAdmin(p.entidade);
    return json(await exigirOperacao(ops.obter)(usuario, lerId(p.id)));
  });
}

/** DELETE /api/admin/:entidade/:id */
export async function DELETE(_request: Request, { params }: Params) {
  return tratar(async () => {
    const p = await params;
    const { ops, usuario } = await prepararAdmin(p.entidade);
    await exigirOperacao(ops.excluir)(usuario, lerId(p.id));
    return semConteudo();
  });
}

/** PATCH /api/admin/reportes/:id — marca o reporte como resolvido */
export async function PATCH(_request: Request, { params }: Params) {
  return tratar(async () => {
    const p = await params;
    const { ops, usuario } = await prepararAdmin(p.entidade);
    await exigirOperacao(ops.resolver)(usuario, lerId(p.id));
    return semConteudo();
  });
}
