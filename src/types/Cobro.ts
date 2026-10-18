/** Cobro de un acarreo (tabla `cobros`). */
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
