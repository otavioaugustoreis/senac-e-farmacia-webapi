const TZ = "America/Sao_Paulo";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const data = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
const umDecimal = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function formatBRL(valor: number): string {
  return moeda.format(valor).replace(/\s/g, " ");
}

export function formatData(d: Date | string): string {
  return data.format(typeof d === "string" ? new Date(d) : d);
}

export function formatKm(km: number): string {
  return `${umDecimal.format(km)} km`;
}
