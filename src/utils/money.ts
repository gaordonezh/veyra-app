export function toCents(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("El monto debe ser mayor que cero");
  }

  return Math.round(amount * 100);
}

export function fromCents(amount: number): number {
  return amount / 100;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(fromCents(amount));
}
