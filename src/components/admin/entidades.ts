import { ROTULO_TIPO, TIPOS_MEDICAMENTO } from "@/domain/medicamento";
import { formatBRL, formatData } from "@/lib/format";

/* Configuração das telas do painel. Os itens chegam da WebApi como JSON (datas em texto ISO). */

export const ENTIDADES = ["medicamentos", "precos", "farmacias", "cupons", "categorias", "reportes"] as const;
export type Entidade = (typeof ENTIDADES)[number];
export type Fonte = "categorias" | "farmacias" | "medicamentos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = any;
export type Valores = Record<string, string | boolean>;

export interface Campo {
  nome: string;
  rotulo: string;
  tipo: "texto" | "numero" | "textarea" | "checkbox" | "data" | "select";
  fonte?: Fonte;
  fixas?: { valor: string; rotulo: string }[];
  obrigatorio?: boolean;
  passo?: string;
  grupo?: string;
}

export interface ConfigEntidade {
  titulo: string;
  singular: string;
  campos: Campo[];
  colunas: { rotulo: string; valor: (i: Item) => string }[];
  paraFormulario: (i: Item) => Valores;
  paraCorpo: (v: Valores) => Record<string, unknown>;
  textoBusca: (i: Item) => string;
  /** Medicamentos carregam a bula à parte ao editar. */
  carregaBula?: boolean;
}

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const diaIso = (iso: string) => s(iso).slice(0, 10);

const CAMPOS_BULA: Campo[] = [
  { nome: "bula.paraQueServe", rotulo: "Para que serve", tipo: "textarea", grupo: "Bula (sem dosagem)" },
  { nome: "bula.contraindicacoes", rotulo: "Contraindicações", tipo: "textarea", grupo: "Bula (sem dosagem)" },
  { nome: "bula.efeitosColaterais", rotulo: "Efeitos colaterais", tipo: "textarea", grupo: "Bula (sem dosagem)" },
  { nome: "bula.advertencias", rotulo: "Advertências", tipo: "textarea", grupo: "Bula (sem dosagem)" },
  { nome: "bula.linkAnvisa", rotulo: "Link no Bulário da Anvisa", tipo: "texto", grupo: "Bula (sem dosagem)" },
];

export const CONFIG: Record<Entidade, ConfigEntidade> = {
  medicamentos: {
    titulo: "Medicamentos",
    singular: "medicamento",
    carregaBula: true,
    campos: [
      { nome: "nomeComercial", rotulo: "Nome comercial", tipo: "texto", obrigatorio: true },
      { nome: "principioAtivo", rotulo: "Princípio ativo", tipo: "texto", obrigatorio: true },
      { nome: "tipo", rotulo: "Tipo", tipo: "select", obrigatorio: true, fixas: TIPOS_MEDICAMENTO.map((t) => ({ valor: t, rotulo: ROTULO_TIPO[t] })) },
      { nome: "categoriaId", rotulo: "Categoria", tipo: "select", fonte: "categorias" },
      { nome: "fabricante", rotulo: "Fabricante", tipo: "texto" },
      { nome: "apresentacao", rotulo: "Apresentação", tipo: "texto" },
      { nome: "imagemUrl", rotulo: "Endereço da foto (https)", tipo: "texto", grupo: "Foto (licença livre, com crédito)" },
      { nome: "imagemCredito", rotulo: "Crédito (autor · licença)", tipo: "texto", grupo: "Foto (licença livre, com crédito)" },
      { nome: "imagemFonte", rotulo: "Página de origem da foto", tipo: "texto", grupo: "Foto (licença livre, com crédito)" },
      ...CAMPOS_BULA,
    ],
    colunas: [
      { rotulo: "Nome", valor: (i) => i.nomeComercial },
      { rotulo: "Foto", valor: (i) => (i.imagem ? "Sim" : "—") },
      { rotulo: "Princípio ativo", valor: (i) => i.principioAtivo },
      { rotulo: "Tipo", valor: (i) => ROTULO_TIPO[i.tipo as keyof typeof ROTULO_TIPO] ?? i.tipo },
      { rotulo: "Categoria", valor: (i) => i.categoria?.nome ?? "—" },
      { rotulo: "Menor preço", valor: (i) => (i.menorPreco !== null ? formatBRL(i.menorPreco) : "—") },
    ],
    paraFormulario: (i) => ({
      id: s(i.id), nomeComercial: s(i.nomeComercial), principioAtivo: s(i.principioAtivo), tipo: s(i.tipo || "generico"),
      categoriaId: s(i.categoria?.id), fabricante: s(i.fabricante), apresentacao: s(i.apresentacao),
      imagemUrl: s(i.imagem?.url), imagemCredito: s(i.imagem?.credito), imagemFonte: s(i.imagem?.fonte),
    }),
    paraCorpo: (v) => ({
      id: v.id || undefined, nomeComercial: v.nomeComercial, principioAtivo: v.principioAtivo, tipo: v.tipo,
      categoriaId: v.categoriaId || null, fabricante: v.fabricante, apresentacao: v.apresentacao,
      imagemUrl: v.imagemUrl, imagemCredito: v.imagemCredito, imagemFonte: v.imagemFonte,
      bula: {
        paraQueServe: v["bula.paraQueServe"], contraindicacoes: v["bula.contraindicacoes"],
        efeitosColaterais: v["bula.efeitosColaterais"], advertencias: v["bula.advertencias"], linkAnvisa: v["bula.linkAnvisa"],
      },
    }),
    textoBusca: (i) => `${i.nomeComercial} ${i.principioAtivo} ${i.fabricante}`,
  },

  precos: {
    titulo: "Preços",
    singular: "preço",
    campos: [
      { nome: "medicamentoId", rotulo: "Medicamento", tipo: "select", fonte: "medicamentos", obrigatorio: true },
      { nome: "farmaciaId", rotulo: "Farmácia", tipo: "select", fonte: "farmacias", obrigatorio: true },
      { nome: "valor", rotulo: "Valor (R$)", tipo: "numero", passo: "0.01", obrigatorio: true },
    ],
    colunas: [
      { rotulo: "Medicamento", valor: (i) => i.medicamento },
      { rotulo: "Farmácia", valor: (i) => i.farmacia?.nome },
      { rotulo: "Valor", valor: (i) => formatBRL(i.valor) },
      { rotulo: "Atualizado em", valor: (i) => formatData(i.atualizadoEm) },
    ],
    paraFormulario: (i) => ({ id: s(i.id), medicamentoId: s(i.medicamentoId), farmaciaId: s(i.farmacia?.id), valor: s(i.valor) }),
    paraCorpo: (v) => ({ id: v.id || undefined, medicamentoId: v.medicamentoId, farmaciaId: v.farmaciaId, valor: v.valor }),
    textoBusca: (i) => `${i.medicamento} ${i.farmacia?.nome}`,
  },

  farmacias: {
    titulo: "Farmácias",
    singular: "farmácia",
    campos: [
      { nome: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true },
      { nome: "endereco", rotulo: "Endereço", tipo: "texto", obrigatorio: true },
      { nome: "telefone", rotulo: "Telefone", tipo: "texto" },
      { nome: "lat", rotulo: "Latitude", tipo: "numero", passo: "any", obrigatorio: true },
      { nome: "lng", rotulo: "Longitude", tipo: "numero", passo: "any", obrigatorio: true },
      { nome: "parceira", rotulo: "Farmácia parceira", tipo: "checkbox" },
    ],
    colunas: [
      { rotulo: "Nome", valor: (i) => i.nome },
      { rotulo: "Endereço", valor: (i) => i.endereco },
      { rotulo: "Parceira", valor: (i) => (i.parceira ? "Sim" : "Não") },
      { rotulo: "Lat, Lng", valor: (i) => `${Number(i.lat).toFixed(4)}, ${Number(i.lng).toFixed(4)}` },
    ],
    paraFormulario: (i) => ({
      id: s(i.id), nome: s(i.nome), endereco: s(i.endereco), telefone: s(i.telefone), lat: s(i.lat), lng: s(i.lng), parceira: Boolean(i.parceira),
    }),
    paraCorpo: (v) => ({ id: v.id || undefined, nome: v.nome, endereco: v.endereco, telefone: v.telefone, lat: v.lat, lng: v.lng, parceira: v.parceira === true }),
    textoBusca: (i) => `${i.nome} ${i.endereco}`,
  },

  cupons: {
    titulo: "Cupons",
    singular: "cupom",
    campos: [
      { nome: "farmaciaId", rotulo: "Farmácia", tipo: "select", fonte: "farmacias", obrigatorio: true },
      { nome: "codigo", rotulo: "Código", tipo: "texto", obrigatorio: true },
      { nome: "desconto", rotulo: "Desconto (ex.: 10% ou R$ 5)", tipo: "texto", obrigatorio: true },
      { nome: "descricao", rotulo: "Descrição", tipo: "texto" },
      { nome: "validade", rotulo: "Válido até", tipo: "data", obrigatorio: true },
    ],
    colunas: [
      { rotulo: "Código", valor: (i) => i.codigo },
      { rotulo: "Farmácia", valor: (i) => i.farmacia?.nome },
      { rotulo: "Desconto", valor: (i) => i.desconto },
      { rotulo: "Validade", valor: (i) => formatData(i.validade) },
    ],
    paraFormulario: (i) => ({
      id: s(i.id), farmaciaId: s(i.farmacia?.id), codigo: s(i.codigo), desconto: s(i.desconto), descricao: s(i.descricao), validade: diaIso(i.validade),
    }),
    paraCorpo: (v) => ({ id: v.id || undefined, farmaciaId: v.farmaciaId, codigo: v.codigo, desconto: v.desconto, descricao: v.descricao, validade: v.validade }),
    textoBusca: (i) => `${i.codigo} ${i.farmacia?.nome} ${i.descricao}`,
  },

  categorias: {
    titulo: "Categorias",
    singular: "categoria",
    campos: [{ nome: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true }],
    colunas: [{ rotulo: "Nome", valor: (i) => i.nome }],
    paraFormulario: (i) => ({ id: s(i.id), nome: s(i.nome) }),
    paraCorpo: (v) => ({ id: v.id || undefined, nome: v.nome }),
    textoBusca: (i) => i.nome,
  },

  reportes: {
    titulo: "Reportes de preço",
    singular: "reporte",
    campos: [],
    colunas: [
      { rotulo: "Medicamento", valor: (i) => i.medicamento },
      { rotulo: "Farmácia", valor: (i) => i.farmacia },
      { rotulo: "Valor", valor: (i) => formatBRL(i.valor) },
      { rotulo: "Comentário", valor: (i) => i.comentario || "—" },
      { rotulo: "Data", valor: (i) => formatData(i.criadoEm) },
      { rotulo: "Situação", valor: (i) => (i.resolvido ? "Resolvido" : "Aberto") },
    ],
    paraFormulario: () => ({}),
    paraCorpo: () => ({}),
    textoBusca: (i) => `${i.medicamento} ${i.farmacia} ${i.comentario}`,
  },
};

export function rotuloOpcao(fonte: Fonte, i: Item): string {
  if (fonte === "medicamentos") return `${i.nomeComercial} (${i.apresentacao})`;
  return i.nome;
}
