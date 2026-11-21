import type { MedicamentoComBulaInput } from "@/application/casos-de-uso/admin";
import type { CategoriaInput, CupomInput, FarmaciaInput, PrecoInput } from "@/application/ports";
import { BULARIO_ANVISA_URL } from "@/domain/bula";
import { DomainError } from "@/domain/erros";
import type { TipoMedicamento } from "@/domain/medicamento";
import { dataDoDia } from "@/infrastructure/mapeadores";

type Corpo = Record<string, unknown>;

const texto = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Aceita número ou texto com vírgula decimal ("7,49"). */
export function numero(v: unknown): number {
  if (typeof v === "number") return v;
  let t = texto(v).trim();
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  return t === "" ? Number.NaN : Number(t);
}

const idOpcional = (v: unknown) => {
  const n = numero(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

const idOuNulo = (v: unknown) => idOpcional(v) ?? null;

export const paraMedicamento = (c: Corpo): MedicamentoComBulaInput => {
  const b = (c.bula ?? null) as Corpo | null;
  return {
    id: idOpcional(c.id),
    nomeComercial: texto(c.nomeComercial),
    principioAtivo: texto(c.principioAtivo),
    categoriaId: idOuNulo(c.categoriaId),
    tipo: texto(c.tipo) as TipoMedicamento,
    fabricante: texto(c.fabricante),
    apresentacao: texto(c.apresentacao),
    imagemUrl: texto(c.imagemUrl),
    imagemCredito: texto(c.imagemCredito),
    imagemFonte: texto(c.imagemFonte),
    bula: b
      ? {
          paraQueServe: texto(b.paraQueServe), contraindicacoes: texto(b.contraindicacoes),
          efeitosColaterais: texto(b.efeitosColaterais), advertencias: texto(b.advertencias),
          linkAnvisa: texto(b.linkAnvisa) || BULARIO_ANVISA_URL,
        }
      : undefined,
  };
};

export const paraCategoria = (c: Corpo): CategoriaInput => ({ id: idOpcional(c.id), nome: texto(c.nome) });

export const paraFarmacia = (c: Corpo): FarmaciaInput => ({
  id: idOpcional(c.id),
  nome: texto(c.nome),
  endereco: texto(c.endereco),
  telefone: texto(c.telefone).trim() || null,
  parceira: c.parceira === true || c.parceira === "true" || c.parceira === "on",
  lat: numero(c.lat),
  lng: numero(c.lng),
});

export const paraPreco = (c: Corpo): PrecoInput => ({
  id: idOpcional(c.id),
  medicamentoId: numero(c.medicamentoId),
  farmaciaId: numero(c.farmaciaId),
  valor: numero(c.valor),
});

export const paraCupom = (c: Corpo): CupomInput => {
  const validade = texto(c.validade);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validade)) throw new DomainError("Validade inválida");
  return {
    id: idOpcional(c.id),
    farmaciaId: numero(c.farmaciaId),
    codigo: texto(c.codigo),
    descricao: texto(c.descricao),
    desconto: texto(c.desconto),
    validade: dataDoDia(validade),
  };
};
