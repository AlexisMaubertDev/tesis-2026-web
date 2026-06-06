import type { Sucursal } from "./Sucursal";
import type { Usuario } from "./Usuario";

export interface Barrera {
  id: string;
  Sucursal: Sucursal;
  ubicacion: string;
}

export interface Turno_Barrera {
  id: string;
  Usuarios: Usuario[];
  Barrera: Barrera;
  fecha_inicio: Date;
  fecha_fin: Date | null;
  turno: ["MAÑANA", "TARDE", "NOCHE"];
  observaciones: string | null;
  incidencias: string | null;
}
