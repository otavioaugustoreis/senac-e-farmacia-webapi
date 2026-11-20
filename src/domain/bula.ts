export interface Bula {
  medicamentoId: number;
  paraQueServe: string;
  contraindicacoes: string;
  efeitosColaterais: string;
  advertencias: string;
  linkAnvisa: string;
}

/** O app informa, não orienta tratamento: nunca exibe dosagem. */
export const COMO_USAR_PADRAO = "Siga a orientação médica e a bula oficial.";
export const BULARIO_ANVISA_URL = "https://consultas.anvisa.gov.br/#/bulario/";
