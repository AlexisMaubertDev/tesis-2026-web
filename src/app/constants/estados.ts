import type { EstadoAcarreo } from "../../types/Vehiculo";

/**
 * Estados posibles del último acarreo de un vehículo, en el orden del ciclo de
 * vida del acarreo. Se usan para la columna "Estado" y su filtro.
 */
export const ESTADOS_ACARREO: EstadoAcarreo[] = [
  "ACARREADO",
  "EN_PLAYA",
  "COBRADO",
  "RETIRADO",
  "SIN_CARGO",
];

/** Etiquetas legibles de los estados del acarreo, para tablas e informes. */
export const ETIQUETAS_ESTADO_ACARREO: Record<EstadoAcarreo, string> = {
  ACARREADO: "Acarreado",
  EN_PLAYA: "En playa",
  COBRADO: "Cobrado",
  RETIRADO: "Retirado",
  SIN_CARGO: "Sin cargo",
};

export const etiquetaEstadoAcarreo = (
  estado: EstadoAcarreo | null | undefined,
) => (estado ? ETIQUETAS_ESTADO_ACARREO[estado] : "-");
