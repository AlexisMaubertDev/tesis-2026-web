import api from "../../../services/api";
import { obtenerConCache } from "../../../app/offline/cache";
import { exigirConexion } from "../../../app/offline/writes";

export const obtenerBarreras = async (token: string) => {
  return obtenerConCache({
    key: "barreras",
    fetcher: async () => {
      const res = await api.get("/barreras", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
  });
};

export const obtenerBarrerasSucursal = async (token: string, id: string) => {
  return obtenerConCache({
    key: `barreras:sucursal:${id}`,
    fetcher: async () => {
      const res = await api.get(`/barreras/sucursal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });
};

/**
 * Turno de barrera activo del usuario autenticado (lo usa el home del playero).
 * Devuelve `null` en `data` si el playero no tiene una barrera asignada.
 */
export const obtenerMiTurnoBarrera = async (token: string) => {
  return obtenerConCache({
    key: "barreras:mi-turno",
    fetcher: async () => {
      const res = await api.get("/barreras/mi-turno", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });
};

export const asignarBarrera = async (
  token: string,
  data: {
    id_barrera: string;
    turno: string;
    id_usuarios: string[];
  },
) => {
  exigirConexion("la asignación del turno de barrera");
  const res = await api.post("/barreras/asignar", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const finalizarTurnoBarrera = async (token: string, id: string) => {
  exigirConexion("el cierre del turno de barrera");
  const res = await api.put(
    `/barreras/turno/${id}/finalizar`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

export const agregarIncidenciaBarrera = async (
  token: string,
  id: string,
  incidencias: string,
) => {
  exigirConexion("la carga de la incidencia del turno");
  const res = await api.put(
    `/barreras/turno/${id}/incidencias`,
    { incidencias },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

export const finalizarTodosTurnosBarrera = async (token: string, id: string) => {
  exigirConexion("el cierre de los turnos de barrera de la sucursal");
  const res = await api.put(
    `/barreras/finalizarTodos/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data as {
    success: boolean;
    message: string;
    /** Turnos de barrera que se cerraron (para emitir el informe de cada uno). */
    data: {
      turnos: {
        id: string;
        id_barrera: string;
        turno: "1" | "2" | "3";
        fecha_inicio: string;
        fecha_fin: string;
        barrera: { id: string; ubicacion: string } | null;
      }[];
    };
  };
};
