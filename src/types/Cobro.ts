import type { Acarreo } from "./Acarreo";

export interface Cobro {
  id: string;
  id_turno_caja: string;
  id_acarreo: string;
  /** Importe total cobrado (efectivo + Mercado Pago). */
  total: number;
  efectivo: number;
  mp: number;
  fecha: string;
  estadias: number | null;
  numero_factura: string | null;
}

/**
 * Cobro con el acarreo (y su vehículo) ya incluidos. Es lo que devuelve
 * `GET /cobros/mi-turno` para la lista de cobros del cajero.
 */
export interface CobroConAcarreo extends Cobro {
  Acarreo?: Acarreo | null;
}

/** Totales del turno de caja, calculados a partir de sus cobros. */
export interface TotalesTurno {
  cantidad: number;
  total: number;
  efectivo: number;
  mp: number;
}

/** Turno de caja tal como lo devuelve `GET /cobros/mi-turno`. */
export interface TurnoDeCobros {
  id: string;
  turno: string;
  apertura: string;
  Caja?: {
    id: string;
    numero_caja: number;
    referencia: string;
  } | null;
}

export interface CobrosDelTurno {
  turno_caja: TurnoDeCobros | null;
  cobros: CobroConAcarreo[];
  totales: TotalesTurno;
}
