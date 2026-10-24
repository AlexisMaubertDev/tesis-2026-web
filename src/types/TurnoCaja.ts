import type { CobroConAcarreo } from "./Cobro";
import type { CajaDelTurno } from "./Usuario";
import type { Usuario } from "./Usuario";

export interface TurnoCajaCerrado {
  id: string;
  id_usuario: string;
  id_caja: string;
  turno: string;
  apertura: string;
  cierre: string | null;
  activo: boolean;
  total_autos: number | null;
  total_estadias: number | null;
  total_acarreos: number | null;
  total_efectivo: number | null;
  total_mp: number | null;
  total: number | null;
  /** Arqueo de cierre (RF14/CU08). */
  numero_sobre: string | null;
  efectivo_contado: number | null;
  incidencias: string | null;
  Caja?: CajaDelTurno | null;
  Usuario?: Pick<Usuario, "id" | "nombre" | "apellido" | "dni" | "rol"> | null;
  /** Sólo presente en el historial de una caja (para contar los cobros). */
  Cobros?: { id: string }[];
}

export interface TurnoCajaDetalle {
  turno: TurnoCajaCerrado;
  cobros: CobroConAcarreo[];
  totales: {
    cantidad: number;
    total: number;
    efectivo: number;
    mp: number;
  };
  /** Arqueo del cierre: efectivo esperado vs. contado (RF14/CU08). */
  arqueo: {
    numero_sobre: string | null;
    efectivoEsperado: number;
    efectivoContado: number | null;
    diferencia: number | null;
  };
}
