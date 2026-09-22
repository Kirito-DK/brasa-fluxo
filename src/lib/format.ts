export function brl(value: number | null | undefined): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value ?? 0),
  );
}

export function dataBR(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseDate(value) : value;
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function dataHoraBR(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00Z`);
  return new Date(value);
}

export function hojeISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

/** Dias até a data (negativo = atrasado). */
export function diasAte(dateISO: string | null | undefined): number | null {
  if (!dateISO) return null;
  const alvo = parseDate(dateISO).getTime();
  const hoje = parseDate(hojeISO()).getTime();
  return Math.round((alvo - hoje) / 86400000);
}

export function numeroBR(value: number | null | undefined, casas = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas,
  }).format(Number(value ?? 0));
}
