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
