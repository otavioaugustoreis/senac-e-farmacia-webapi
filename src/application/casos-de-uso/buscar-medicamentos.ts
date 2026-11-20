import type { Repositorios } from "../ports";

export const buscarMedicamentos = (repos: Pick<Repositorios, "medicamentos">) =>
  (q: string, categoriaId?: number) => repos.medicamentos.buscar((q ?? "").trim(), categoriaId);

export const listarCategorias = (repos: Pick<Repositorios, "categorias">) =>
  () => repos.categorias.listar();
