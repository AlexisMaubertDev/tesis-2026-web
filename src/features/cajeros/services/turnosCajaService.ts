import api from "../../../services/api";
import type { TurnoCajaCerrado, TurnoCajaDetalle } from "../../../types/TurnoCaja";

export const obtenerTurnosCerrados = async (token: string) => {
  const res = await api.get("/turno_caja/cerrados", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as { success: boolean; data: TurnoCajaCerrado[]; message: string };
};

/** Todos los turnos de caja de un usuario (abiertos y cerrados). */
export const obtenerTurnosDeUsuario = async (token: string, idUsuario: string) => {
  const res = await api.get(`/turno_caja/usuario/${idUsuario}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as { success: boolean; data: TurnoCajaCerrado[]; message: string };
};

/** Historial de turnos (abiertos y cerrados) de una caja. */
export const obtenerTurnosDeCaja = async (token: string, idCaja: string) => {
  const res = await api.get(`/turno_caja/cajas/${idCaja}`, {
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

/** Agrega una incidencia al turno de caja (sólo supervisor o sistemas). */
export const agregarIncidenciaTurnoCaja = async (
  token: string,
  id: string,
  incidencias: string,
) => {
  const res = await api.put(
    `/turno_caja/${id}/incidencias`,
    { incidencias },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};
