import api from "../../../services/api";
import type {
  TurnoBarreraDetalle,
  TurnoBarreraListado,
} from "../../../types/TurnoBarrera";

/** Todos los turnos de barrera (historial, con barrera y playeros). */
export const obtenerTurnosBarrera = async (token: string) => {
  const res = await api.get("/barreras/turnos", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoBarreraListado[];
    message: string;
  };
};

/** Turnos de barrera en los que estuvo asignado un playero. */
export const obtenerTurnosBarreraDeUsuario = async (
  token: string,
  idUsuario: string,
) => {
  const res = await api.get(`/barreras/turnos/usuario/${idUsuario}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoBarreraListado[];
    message: string;
  };
};

/** Detalle de un turno de barrera con los acarreos ingresados a la playa. */
export const obtenerDetalleTurnoBarrera = async (token: string, id: string) => {
  const res = await api.get(`/barreras/turnos/${id}/detalle`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoBarreraDetalle;
    message: string;
  };
};

/** Historial de turnos (abiertos y cerrados) de una barrera. */
export const obtenerTurnosBarreraDeBarrera = async (
  token: string,
  idBarrera: string,
) => {
  const res = await api.get(`/barreras/turnos/barrera/${idBarrera}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as {
    success: boolean;
    data: TurnoBarreraListado[];
    message: string;
  };
};
