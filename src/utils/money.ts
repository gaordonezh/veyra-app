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

export function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
