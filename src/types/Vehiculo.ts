import type { Sucursal } from "./Sucursal";

export type EstadoAcarreo =
  | "ACARREADO"
  | "INGRESADO"
  | "EGRESADO"
  | "COBRADO"
  | "SIN_CARGO";

export interface Vehiculo {
  id?: string;
  patente: string;
  marca: string;
  modelo: string;
  color: string;
  // Campos calculados por GET /vehiculos a partir de los acarreos del vehículo.
  cantidad_acarreos?: number;
  ultimo_acarreo?: string | null;
  // Id del último acarreo: lo usan las acciones de la barrera (ingresar/egresar).
  ultimo_acarreo_id?: string | null;
  // Estado real del último acarreo (ACARREADO, INGRESADO, ...). Es lo que se
  // muestra en la columna "Estado".
  ultimo_acarreo_estado?: EstadoAcarreo | null;
  // Sucursal del último acarreo (acarreo -> turno de grúa -> grúa -> sucursal).
  Sucursal?: Sucursal | null;
}
