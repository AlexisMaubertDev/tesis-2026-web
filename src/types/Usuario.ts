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
  turno_grua_chofer_activo?: Turno_Grua | null;
}

export interface Turno_Caja {
  id: string;
  apertura: Date;
  Caja: Caja;
  Usuario: Usuario;
  turno: string;
}

// Turno de caja abierto que devuelve `GET /usuarios` para el "Ver detalle":
// viene con la caja y su sucursal, no con la caja completa.
export interface Turno_Caja_Activo {
  id: string;
  apertura: string;
  turno: string;
  Caja?: {
    id: string;
    numero_caja: number;
    referencia: string;
    Sucursal?: { id: string; nombre: string } | null;
  } | null;
}
