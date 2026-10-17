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
  ultimo_acarreo_estado?: EstadoAcarreo | null;
  en_playa?: boolean;
  // Sucursal del último acarreo (acarreo -> turno de grúa -> grúa -> sucursal).
  Sucursal?: Sucursal | null;
}
