import type { Sucursal } from "./Sucursal";
import type { Turno_Caja } from "./Usuario";

export interface Caja {
  id: string;
  numero_caja: number;
  referencia: string;
  referencia_pago: string;
  Sucursal: Sucursal;
  Turno_Cajas: Turno_Caja[];
}

export interface CajaActiva extends Caja {
  Turno_Caja: Turno_Caja;
}
