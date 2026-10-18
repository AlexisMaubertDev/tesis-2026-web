// Formatea un importe en pesos argentinos con dos decimales (ej: $83.000,00).
export const formatCurrency = (valor: number | string | null | undefined): string => {
  const numero = Number(valor ?? 0);

  if (!Number.isFinite(numero)) return "$0,00";

  return numero.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Redondea a 2 decimales para comparar importes sin errores de punto flotante
// (0.1 + 0.2 !== 0.3).
export const redondearImporte = (valor: number): number =>
  Math.round(valor * 100) / 100;
