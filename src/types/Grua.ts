import type { Sucursal } from "./Sucursal";

export interface Grua {
  id: string;
  Sucursal: Sucursal;
  patente: string;
  numero: number;
  modelo: string;
  estado: "DISPONIBLE" | "EN_SERVICIO" | "FUERA_DE_SERVICIO" | "MANTENIMIENTO";
  observaciones: string | null;
  incidencias: string | null;
}
