import { TYPE_LABELS, MEDICINE_TYPES } from "@/domain/medicine";
import { formatBRL, formatDate } from "@/lib/format";

export const ENTITIES = ["medicamentos", "precos", "farmacias", "cupons", "categorias", "reportes"] as const;
export type Entity = (typeof ENTITIES)[number];
export type OptionSource = "categorias" | "farmacias" | "medicamentos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = any;
export type FormValues = Record<string, string | boolean>;

export interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "checkbox" | "date" | "select";
  source?: OptionSource;
  fixedOptions?: { value: string; label: string }[];
  required?: boolean;
  step?: string;
  group?: string;
}

export interface EntityConfig {
  title: string;
  singular: string;
  fields: Field[];
  columns: { label: string; value: (i: Item) => string }[];
  toForm: (i: Item) => FormValues;
  toBody: (v: FormValues) => Record<string, unknown>;
  searchText: (i: Item) => string;
  loadsPackageInsert?: boolean;
}

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const isoDay = (iso: string) => s(iso).slice(0, 10);

const PACKAGE_INSERT_FIELDS: Field[] = [
  { name: "packageInsert.usedFor", label: "Para que serve", type: "textarea", group: "Bula (sem dosagem)" },
  { name: "packageInsert.contraindications", label: "Contraindicações", type: "textarea", group: "Bula (sem dosagem)" },
  { name: "packageInsert.sideEffects", label: "Efeitos colaterais", type: "textarea", group: "Bula (sem dosagem)" },
  { name: "packageInsert.warnings", label: "Advertências", type: "textarea", group: "Bula (sem dosagem)" },
  { name: "packageInsert.anvisaLink", label: "Link no Bulário da Anvisa", type: "text", group: "Bula (sem dosagem)" },
];

export const ENTITY_CONFIG: Record<Entity, EntityConfig> = {
  medicamentos: {
    title: "Medicamentos",
    singular: "medicamento",
    loadsPackageInsert: true,
    fields: [
      { name: "brandName", label: "Nome comercial", type: "text", required: true },
      { name: "activeIngredient", label: "Princípio ativo", type: "text", required: true },
      { name: "type", label: "Tipo", type: "select", required: true, fixedOptions: MEDICINE_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] })) },
      { name: "categoryId", label: "Categoria", type: "select", source: "categorias" },
      { name: "manufacturer", label: "Fabricante", type: "text" },
      { name: "presentation", label: "Apresentação", type: "text" },
      { name: "imageUrl", label: "Endereço da foto (https)", type: "text", group: "Foto (licença livre, com crédito)" },
      { name: "imageCredit", label: "Crédito (autor · licença)", type: "text", group: "Foto (licença livre, com crédito)" },
      { name: "imageSource", label: "Página de origem da foto", type: "text", group: "Foto (licença livre, com crédito)" },
      ...PACKAGE_INSERT_FIELDS,
    ],
    columns: [
      { label: "Nome", value: (i) => i.brandName },
      { label: "Foto", value: (i) => (i.image ? "Sim" : "—") },
      { label: "Princípio ativo", value: (i) => i.activeIngredient },
      { label: "Tipo", value: (i) => TYPE_LABELS[i.type as keyof typeof TYPE_LABELS] ?? i.type },
      { label: "Categoria", value: (i) => i.category?.name ?? "—" },
      { label: "Menor preço", value: (i) => (i.lowestPrice !== null ? formatBRL(i.lowestPrice) : "—") },
    ],
    toForm: (i) => ({
      id: s(i.id), brandName: s(i.brandName), activeIngredient: s(i.activeIngredient), type: s(i.type || "generico"),
      categoryId: s(i.category?.id), manufacturer: s(i.manufacturer), presentation: s(i.presentation),
      imageUrl: s(i.image?.url), imageCredit: s(i.image?.credit), imageSource: s(i.image?.source),
    }),
    toBody: (v) => ({
      id: v.id || undefined, brandName: v.brandName, activeIngredient: v.activeIngredient, type: v.type,
      categoryId: v.categoryId || null, manufacturer: v.manufacturer, presentation: v.presentation,
      imageUrl: v.imageUrl, imageCredit: v.imageCredit, imageSource: v.imageSource,
      packageInsert: {
        usedFor: v["packageInsert.usedFor"], contraindications: v["packageInsert.contraindications"],
        sideEffects: v["packageInsert.sideEffects"], warnings: v["packageInsert.warnings"], anvisaLink: v["packageInsert.anvisaLink"],
      },
    }),
    searchText: (i) => `${i.brandName} ${i.activeIngredient} ${i.manufacturer}`,
  },

  precos: {
    title: "Preços",
    singular: "preço",
    fields: [
      { name: "medicineId", label: "Medicamento", type: "select", source: "medicamentos", required: true },
      { name: "pharmacyId", label: "Farmácia", type: "select", source: "farmacias", required: true },
      { name: "amount", label: "Valor (R$)", type: "number", step: "0.01", required: true },
    ],
    columns: [
      { label: "Medicamento", value: (i) => i.medicine },
      { label: "Farmácia", value: (i) => i.pharmacy?.name },
      { label: "Valor", value: (i) => formatBRL(i.amount) },
      { label: "Atualizado em", value: (i) => formatDate(i.updatedAt) },
    ],
    toForm: (i) => ({ id: s(i.id), medicineId: s(i.medicineId), pharmacyId: s(i.pharmacy?.id), amount: s(i.amount) }),
    toBody: (v) => ({ id: v.id || undefined, medicineId: v.medicineId, pharmacyId: v.pharmacyId, amount: v.amount }),
    searchText: (i) => `${i.medicine} ${i.pharmacy?.name}`,
  },

  farmacias: {
    title: "Farmácias",
    singular: "farmácia",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "address", label: "Endereço", type: "text", required: true },
      { name: "phone", label: "Telefone", type: "text" },
      { name: "lat", label: "Latitude", type: "number", step: "any", required: true },
      { name: "lng", label: "Longitude", type: "number", step: "any", required: true },
      { name: "isPartner", label: "Farmácia parceira", type: "checkbox" },
    ],
    columns: [
      { label: "Nome", value: (i) => i.name },
      { label: "Endereço", value: (i) => i.address },
      { label: "Parceira", value: (i) => (i.isPartner ? "Sim" : "Não") },
      { label: "Lat, Lng", value: (i) => `${Number(i.lat).toFixed(4)}, ${Number(i.lng).toFixed(4)}` },
    ],
    toForm: (i) => ({
      id: s(i.id), name: s(i.name), address: s(i.address), phone: s(i.phone), lat: s(i.lat), lng: s(i.lng), isPartner: Boolean(i.isPartner),
    }),
    toBody: (v) => ({ id: v.id || undefined, name: v.name, address: v.address, phone: v.phone, lat: v.lat, lng: v.lng, isPartner: v.isPartner === true }),
    searchText: (i) => `${i.name} ${i.address}`,
  },

  cupons: {
    title: "Cupons",
    singular: "cupom",
    fields: [
      { name: "pharmacyId", label: "Farmácia", type: "select", source: "farmacias", required: true },
      { name: "code", label: "Código", type: "text", required: true },
      { name: "discount", label: "Desconto (ex.: 10% ou R$ 5)", type: "text", required: true },
      { name: "description", label: "Descrição", type: "text" },
      { name: "validUntil", label: "Válido até", type: "date", required: true },
    ],
    columns: [
      { label: "Código", value: (i) => i.code },
      { label: "Farmácia", value: (i) => i.pharmacy?.name },
      { label: "Desconto", value: (i) => i.discount },
      { label: "Validade", value: (i) => formatDate(i.validUntil) },
    ],
    toForm: (i) => ({
      id: s(i.id), pharmacyId: s(i.pharmacy?.id), code: s(i.code), discount: s(i.discount), description: s(i.description), validUntil: isoDay(i.validUntil),
    }),
    toBody: (v) => ({ id: v.id || undefined, pharmacyId: v.pharmacyId, code: v.code, discount: v.discount, description: v.description, validUntil: v.validUntil }),
    searchText: (i) => `${i.code} ${i.pharmacy?.name} ${i.description}`,
  },

  categorias: {
    title: "Categorias",
    singular: "categoria",
    fields: [{ name: "name", label: "Nome", type: "text", required: true }],
    columns: [{ label: "Nome", value: (i) => i.name }],
    toForm: (i) => ({ id: s(i.id), name: s(i.name) }),
    toBody: (v) => ({ id: v.id || undefined, name: v.name }),
    searchText: (i) => i.name,
  },

  reportes: {
    title: "Reportes de preço",
    singular: "reporte",
    fields: [],
    columns: [
      { label: "Medicamento", value: (i) => i.medicine },
      { label: "Farmácia", value: (i) => i.pharmacy },
      { label: "Valor", value: (i) => formatBRL(i.amount) },
      { label: "Comentário", value: (i) => i.comment || "—" },
      { label: "Data", value: (i) => formatDate(i.createdAt) },
      { label: "Situação", value: (i) => (i.resolved ? "Resolvido" : "Aberto") },
    ],
    toForm: () => ({}),
    toBody: () => ({}),
    searchText: (i) => `${i.medicine} ${i.pharmacy} ${i.comment}`,
  },
};

export function optionLabel(source: OptionSource, i: Item): string {
  if (source === "medicamentos") return `${i.brandName} (${i.presentation})`;
  return i.name;
}
