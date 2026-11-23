const TZ = "America/Sao_Paulo";

const currencyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const data = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
const oneDecimal = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function formatBRL(amount: number): string {
  return currencyFormat.format(amount).replace(/\s/g, " ");
}

export function formatDate(d: Date | string): string {
  return data.format(typeof d === "string" ? new Date(d) : d);
}

export function formatKm(km: number): string {
  return `${oneDecimal.format(km)} km`;
}
