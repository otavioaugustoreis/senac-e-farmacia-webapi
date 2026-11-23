/** Normaliza texto para comparação: sem acentos, minúsculo e sem espaços nas pontas. */
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
