import type { PackageInsert } from "@/domain/package-insert";
import { dayInSaoPaulo, type Coupon } from "@/domain/coupon";
import type { Pharmacy, NearbyPharmacy } from "@/domain/pharmacy";
import { buildImage, type Medicine, type SearchResult, type MedicineType } from "@/domain/medicine";
import type { Price } from "@/domain/price";
import type { PriceReport } from "@/domain/report";

type Numeric = number | string | null;
const num = (v: Numeric): number | null => (v === null || v === undefined ? null : Number(v));

interface ImageColumns {
  imagem_url?: string | null; imagem_credito?: string | null; imagem_fonte?: string | null;
}

export interface SearchRow extends ImageColumns {
  id: number; nome_comercial: string; principio_ativo: string; tipo: MedicineType;
  categoria_id: number | null; categoria: string | null; fabricante: string; apresentacao: string; menor_preco: Numeric;
}

export function toSearchResult(l: SearchRow): SearchResult {
  return {
    id: l.id, brandName: l.nome_comercial, activeIngredient: l.principio_ativo, type: l.tipo,
    category: l.categoria_id !== null && l.categoria ? { id: l.categoria_id, name: l.categoria } : null,
    manufacturer: l.fabricante, presentation: l.apresentacao, lowestPrice: num(l.menor_preco),
    image: buildImage(l.imagem_url, l.imagem_credito, l.imagem_fonte),
  };
}

export interface MedicineRow extends ImageColumns {
  id: number; nome_comercial: string; principio_ativo: string; tipo: MedicineType;
  fabricante: string; apresentacao: string; categorias: { id: number; nome: string } | null;
}

export function toMedicine(l: MedicineRow): Medicine {
  return {
    id: l.id, brandName: l.nome_comercial, activeIngredient: l.principio_ativo, type: l.tipo,
    manufacturer: l.fabricante, presentation: l.apresentacao, category: l.categorias ? { id: l.categorias.id, name: l.categorias.nome } : null,
    image: buildImage(l.imagem_url, l.imagem_credito, l.imagem_fonte),
  };
}

export interface PackageInsertRow {
  medicamento_id: number; para_que_serve: string; contraindicacoes: string;
  efeitos_colaterais: string; advertencias: string; link_anvisa: string;
}

export function toPackageInsert(l: PackageInsertRow): PackageInsert {
  return {
    medicineId: l.medicamento_id, usedFor: l.para_que_serve, contraindications: l.contraindicacoes,
    sideEffects: l.efeitos_colaterais, warnings: l.advertencias, anvisaLink: l.link_anvisa,
  };
}

export function fromPackageInsert(b: PackageInsert): PackageInsertRow {
  return {
    medicamento_id: b.medicineId, para_que_serve: b.usedFor, contraindicacoes: b.contraindications,
    efeitos_colaterais: b.sideEffects, advertencias: b.warnings, link_anvisa: b.anvisaLink,
  };
}

export interface PriceRow {
  id: number; medicamento_id: number; valor: Numeric; atualizado_em: string;
  farmacias: { id: number; nome: string } | null;
  medicamentos?: { nome_comercial: string } | null;
}

export function toPrice(l: PriceRow): Price {
  return {
    id: l.id, medicineId: l.medicamento_id, amount: num(l.valor) ?? 0, updatedAt: new Date(l.atualizado_em),
    pharmacy: l.farmacias ? { id: l.farmacias.id, name: l.farmacias.nome } : { id: 0, name: "" },
  };
}

export interface PharmacyRow {
  id: number; nome: string; endereco: string; telefone: string | null; parceira: boolean; lat: Numeric; lng: Numeric;
  distancia_km?: Numeric;
}

export function toPharmacy(l: PharmacyRow): Pharmacy {
  return { id: l.id, name: l.nome, address: l.endereco, phone: l.telefone, isPartner: l.parceira, lat: num(l.lat) ?? 0, lng: num(l.lng) ?? 0 };
}

export function toNearbyPharmacy(l: PharmacyRow): NearbyPharmacy {
  return { ...toPharmacy(l), distanceKm: num(l.distancia_km ?? null) ?? 0 };
}

/** EWKT aceito pelo PostgREST para colunas geography. */
export function pointEwkt(lat: number, lng: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

export interface CouponRow {
  id: number; codigo: string; descricao: string; desconto: string; validade: string;
  farmacias: { id: number; nome: string; endereco: string } | null;
}

/** `validade` é um dia (date) no calendário de São Paulo; meio-dia evita virar o dia por fuso. */
export function dateFromDay(day: string): Date {
  return new Date(`${day}T12:00:00-03:00`);
}

export function toDayString(d: Date): string {
  return dayInSaoPaulo(d);
}

export function toCoupon(l: CouponRow): Coupon {
  return {
    id: l.id, code: l.codigo, description: l.descricao, discount: l.desconto, validUntil: dateFromDay(l.validade),
    pharmacy: l.farmacias ? { id: l.farmacias.id, name: l.farmacias.nome, address: l.farmacias.endereco } : { id: 0, name: "", address: "" },
  };
}

export interface ReportRow {
  id: number; preco_id: number; comentario: string; criado_em: string; resolvido: boolean;
  medicamento: string; farmacia: string; valor: Numeric;
}

export function toReport(l: ReportRow): PriceReport {
  return {
    id: l.id, priceId: l.preco_id, comment: l.comentario, createdAt: new Date(l.criado_em), resolved: l.resolvido,
    medicine: l.medicamento, pharmacy: l.farmacia, amount: num(l.valor) ?? 0,
  };
}
