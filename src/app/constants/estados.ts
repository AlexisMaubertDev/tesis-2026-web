import type { EstadoAcarreo } from "../../types/Vehiculo";

/**
 * Estados posibles del último acarreo de un vehículo, en el orden del ciclo de
 * vida del acarreo. Se usan para la columna "Estado" y su filtro.
 */
export const ESTADOS_ACARREO: EstadoAcarreo[] = [
  "ACARREADO",
  "INGRESADO",
  "COBRADO",
  "EGRESADO",
  "SIN_CARGO",
];

/** Etiquetas legibles de los estados del acarreo, para tablas e informes. */
export const ETIQUETAS_ESTADO_ACARREO: Record<EstadoAcarreo, string> = {
  ACARREADO: "Acarreado",
  INGRESADO: "En playa",
  COBRADO: "Cobrado",
  EGRESADO: "Egresado",
  SIN_CARGO: "Sin cargo",
};

export const etiquetaEstadoAcarreo = (
  estado: EstadoAcarreo | null | undefined,
) => (estado ? ETIQUETAS_ESTADO_ACARREO[estado] : "-");
