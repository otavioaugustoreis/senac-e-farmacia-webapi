export interface PackageInsert {
  medicineId: number;
  usedFor: string;
  contraindications: string;
  sideEffects: string;
  warnings: string;
  anvisaLink: string;
}

/** O app informa, não orienta tratamento: nunca exibe dosagem. */
export const DEFAULT_HOW_TO_USE = "Siga a orientação médica e a bula oficial.";
export const ANVISA_INSERTS_URL = "https://consultas.anvisa.gov.br/#/bulario/";
