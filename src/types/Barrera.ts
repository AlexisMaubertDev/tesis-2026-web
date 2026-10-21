import type { Sucursal } from "./Sucursal";
import type { Usuario } from "./Usuario";

export interface Barrera {
  id: string;
  Sucursal: Sucursal;
  ubicacion: string;
  turno_barrera_activo?: Turno_Barrera | null;
}

export interface Turno_Barrera {
  id: string;
  Usuarios?: Usuario[];
  usuarios_asignados?: { Usuario: Usuario }[];
  Barrera?: Barrera;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  turno: "1" | "2" | "3";
  activo: boolean;
  incidencias: string | null;
}
