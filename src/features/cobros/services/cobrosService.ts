import api from "../../../services/api";

export type NuevoCobro = {
  id_acarreo: string;
  estadias: number | null;
  total: number;
  efectivo: number;
  mp: number;
  numero_factura: string | null;
};

/**
 * Registra el cobro de un acarreo ingresado. El servidor valida el turno de
 * caja abierto del cajero, que el vehículo esté en la playa (INGRESADO) y que
 * los importes sean coherentes (total = efectivo + MP).
 */
export const crearCobro = async (token: string, cobro: NuevoCobro) => {
  const res = await api.post("/cobros", cobro, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
