/** Normaliza texto para comparação: sem acentos, minúsculo e sem espaços nas pontas. */
export function normalizarTexto(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
