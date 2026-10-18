import api from "../../../services/api";
import type { Tarifa } from "../../../types/Tarifa";

export type NuevoCobro = {
  id_acarreo: string;
  efectivo: number;
  mp: number;
  numero_factura: string | null;
};

/** Vista previa del cobro que calcula el servidor (tarifa vigente + estadías). */
export type PreviewCobro = {
  id_acarreo: string;
  fecha_acarreo: string;
  estadias: number;
  max_estadias: number;
  horas_por_estadia: number;
  tope_estadias: boolean;
  tarifa: Tarifa | null;
  total: number | null;
};

/** Total a abonar de un acarreo (tarifa vigente + estadías por reloj). */
export const obtenerPreviewCobro = async (
  token: string,
  id_acarreo: string,
) => {
  const res = await api.get(`/cobros/preview/${id_acarreo}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Registra el cobro de un acarreo ingresado. El servidor valida el turno de
 * caja abierto del cajero, que el vehículo esté en la playa (INGRESADO),
 * calcula el total con la tarifa vigente y las estadías por reloj, y exige que
 * los medios de pago sumen ese total.
 */
export const crearCobro = async (token: string, cobro: NuevoCobro) => {
  const res = await api.post("/cobros", cobro, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
