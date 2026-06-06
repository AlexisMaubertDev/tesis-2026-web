import type { Sucursal } from "./Sucursal";

export interface Caja {
  id: string;
  numero_caja: number;
  referencia: string;
  referencia_pago: string;
  Sucursal: Sucursal;
}
