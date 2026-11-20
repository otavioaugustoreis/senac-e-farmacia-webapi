import type { Bula } from "@/domain/bula";
import { diaEmSaoPaulo, type Cupom } from "@/domain/cupom";
import type { Farmacia, FarmaciaProxima } from "@/domain/farmacia";
import type { Medicamento, ResultadoBusca, TipoMedicamento } from "@/domain/medicamento";
import type { Preco } from "@/domain/preco";
import type { ReportePreco } from "@/domain/reporte";

type Num = number | string | null;
const num = (v: Num): number | null => (v === null || v === undefined ? null : Number(v));

export interface LinhaBusca {
  id: number; nome_comercial: string; principio_ativo: string; tipo: TipoMedicamento;
  categoria_id: number | null; categoria: string | null; fabricante: string; apresentacao: string; menor_preco: Num;
}

export function paraResultadoBusca(l: LinhaBusca): ResultadoBusca {
  return {
    id: l.id, nomeComercial: l.nome_comercial, principioAtivo: l.principio_ativo, tipo: l.tipo,
    categoria: l.categoria_id !== null && l.categoria ? { id: l.categoria_id, nome: l.categoria } : null,
    fabricante: l.fabricante, apresentacao: l.apresentacao, menorPreco: num(l.menor_preco),
  };
}

export interface LinhaMedicamento {
  id: number; nome_comercial: string; principio_ativo: string; tipo: TipoMedicamento;
  fabricante: string; apresentacao: string; categorias: { id: number; nome: string } | null;
}

export function paraMedicamento(l: LinhaMedicamento): Medicamento {
  return {
    id: l.id, nomeComercial: l.nome_comercial, principioAtivo: l.principio_ativo, tipo: l.tipo,
    fabricante: l.fabricante, apresentacao: l.apresentacao, categoria: l.categorias ?? null,
  };
}

export interface LinhaBula {
  medicamento_id: number; para_que_serve: string; contraindicacoes: string;
  efeitos_colaterais: string; advertencias: string; link_anvisa: string;
}

export function paraBula(l: LinhaBula): Bula {
  return {
    medicamentoId: l.medicamento_id, paraQueServe: l.para_que_serve, contraindicacoes: l.contraindicacoes,
    efeitosColaterais: l.efeitos_colaterais, advertencias: l.advertencias, linkAnvisa: l.link_anvisa,
  };
}

export function deBula(b: Bula): LinhaBula {
  return {
    medicamento_id: b.medicamentoId, para_que_serve: b.paraQueServe, contraindicacoes: b.contraindicacoes,
    efeitos_colaterais: b.efeitosColaterais, advertencias: b.advertencias, link_anvisa: b.linkAnvisa,
  };
}

export interface LinhaPreco {
  id: number; medicamento_id: number; valor: Num; atualizado_em: string;
  farmacias: { id: number; nome: string } | null;
  medicamentos?: { nome_comercial: string } | null;
}

export function paraPreco(l: LinhaPreco): Preco {
  return {
    id: l.id, medicamentoId: l.medicamento_id, valor: num(l.valor) ?? 0, atualizadoEm: new Date(l.atualizado_em),
    farmacia: l.farmacias ?? { id: 0, nome: "" },
  };
}

export interface LinhaFarmacia {
  id: number; nome: string; endereco: string; telefone: string | null; parceira: boolean; lat: Num; lng: Num;
  distancia_km?: Num;
}

export function paraFarmacia(l: LinhaFarmacia): Farmacia {
  return { id: l.id, nome: l.nome, endereco: l.endereco, telefone: l.telefone, parceira: l.parceira, lat: num(l.lat) ?? 0, lng: num(l.lng) ?? 0 };
}

export function paraFarmaciaProxima(l: LinhaFarmacia): FarmaciaProxima {
  return { ...paraFarmacia(l), distanciaKm: num(l.distancia_km ?? null) ?? 0 };
}

/** EWKT aceito pelo PostgREST para colunas geography. */
export function pontoEwkt(lat: number, lng: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

export interface LinhaCupom {
  id: number; codigo: string; descricao: string; desconto: string; validade: string;
  farmacias: { id: number; nome: string } | null;
}

/** `validade` é um dia (date) no calendário de São Paulo; meio-dia evita virar o dia por fuso. */
export function dataDoDia(dia: string): Date {
  return new Date(`${dia}T12:00:00-03:00`);
}

export function paraDia(d: Date): string {
  return diaEmSaoPaulo(d);
}

export function paraCupom(l: LinhaCupom): Cupom {
  return {
    id: l.id, codigo: l.codigo, descricao: l.descricao, desconto: l.desconto, validade: dataDoDia(l.validade),
    farmacia: l.farmacias ?? { id: 0, nome: "" },
  };
}

export interface LinhaReporte {
  id: number; preco_id: number; comentario: string; criado_em: string; resolvido: boolean;
  medicamento: string; farmacia: string; valor: Num;
}

export function paraReporte(l: LinhaReporte): ReportePreco {
  return {
    id: l.id, precoId: l.preco_id, comentario: l.comentario, criadoEm: new Date(l.criado_em), resolvido: l.resolvido,
    medicamento: l.medicamento, farmacia: l.farmacia, valor: num(l.valor) ?? 0,
  };
}
