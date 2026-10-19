import api from "../../../services/api";
import type { TurnoGruaDetalle, TurnoGruaListado } from "../../../types/TurnoGrua";

/** Todos los turnos de grúa (historial, con grúa y usuarios). */
export const obtenerTurnosGrua = async (token: string) => {
  const res = await api.get("/turno_grua", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoGruaListado[];
    message: string;
  };
};

/** Turnos de grúa de un usuario (como chofer o enganchador). */
export const obtenerTurnosGruaDeUsuario = async (
  token: string,
  idUsuario: string,
) => {
  const res = await api.get(`/turno_grua/usuario/${idUsuario}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoGruaListado[];
    message: string;
  };
};

/** Detalle de un turno de grúa con los acarreos que hizo. */
export const obtenerDetalleTurnoGrua = async (token: string, id: string) => {
  const res = await api.get(`/turno_grua/${id}/detalle`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoGruaDetalle;
    message: string;
  };
};

/** Historial de turnos (abiertos y cerrados) de una grúa. */
export const obtenerTurnosGruaDeGrua = async (token: string, idGrua: string) => {
  const res = await api.get(`/turno_grua/grua/${idGrua}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoGruaListado[];
    message: string;
  };
};
