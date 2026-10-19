import api from "../../../services/api";
import type { TurnoCajaCerrado, TurnoCajaDetalle } from "../../../types/TurnoCaja";

export const obtenerTurnosCerrados = async (token: string) => {
  const res = await api.get("/turno_caja/cerrados", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as { success: boolean; data: TurnoCajaCerrado[]; message: string };
};

export const obtenerDetalleTurnoCaja = async (token: string, id: string) => {
  const res = await api.get(`/turno_caja/${id}/detalle`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as { success: boolean; data: TurnoCajaDetalle; message: string };
};
