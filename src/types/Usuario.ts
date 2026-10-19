import type { Caja } from "./Caja";
import type { Turno_Grua } from "./Grua";
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
  intentos_restantes?: number;
  Sucursal: Sucursal;
  rol: "PLAYERO" | "CAJERO" | "SUPERVISOR" | "SISTEMAS" | "GRUERO";
  Turno_Caja?: Turno_Caja | null;
  turno_caja_activo?: Turno_Caja_Activo | null;
  turno_grua_enganchador_activo?: Turno_Grua | null;
  turnos_barrera?: { turno_barrera?: { activo?: boolean } | null }[] | null;
  turno_grua_chofer_activo?: Turno_Grua | null;
}

/**
 * Caja tal como viene anidada en un turno: `empezar_turno` devuelve la caja
 * completa, y el login (`turno_caja_activo`) la devuelve sin sus propios turnos.
 */
export interface CajaDelTurno {
  id: string;
  numero_caja: number;
  referencia: string;
  Sucursal?: { id: string; nombre: string } | null;
}

export interface Turno_Caja {
  id: string;
  /** La API lo manda como ISO string (en `empezar_turno` está tipado `Date`). */
  apertura: string | Date;
  turno: string;
  Caja: Caja | CajaDelTurno;
  Usuario?: Usuario | null;
}

/**
 * Turno de caja abierto que devuelven `GET /usuarios` y el login. Tiene la
 * misma forma que un turno común, así que es un alias para no duplicar el tipo.
 */
export type Turno_Caja_Activo = Turno_Caja;
