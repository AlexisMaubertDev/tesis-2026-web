import type { Caja } from "./Caja";
import type { Sucursal } from "./Sucursal";

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  legajo: string;
  dni: string;
  email: string | null;
  numero_turno: number;
  trabaja_domingo: boolean;
  bloqueado: boolean;
  Sucursal: Sucursal;
  rol: "PLAYERO" | "CAJERO" | "SUPERVISOR" | "SISTEMAS";
  Turno_Caja?: Turno_Caja | null;
}

export interface Turno_Caja {
  id: string;
  apertura: Date;
  Caja: Caja;
  Usuario: Usuario;
}
