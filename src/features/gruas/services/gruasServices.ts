import api from "../../../services/api";
import type { Grua, Turno_Grua } from "../../../types/Grua";
import type { GruaForm } from "../components/GruaModal";

export const obtenerGruas = async (token: string) => {
  const res = await api.get("/gruas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
export const crearGrua = async (token: string, data: GruaForm) => {
  const response = await api.post("/gruas", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const obtenerGruasSucursal = async (token: string, id: string) => {
  const res = await api.get(`/gruas/sucursal/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const asignarGrua = async (token: string, data: Turno_Grua) => {
  const res = await api.post("/gruas/asignar", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const finalizarTurnosSucursal = async (token: string, id: string) => {
  const res = await api.put(
    `/turno_grua/finalizar/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const agregarIncidencia = async (
  token: string,
  incidencias: string,
  id: string,
) => {
  const res = await api.put(
    `/turno_grua/${id}/incidencias`,
    { incidencias },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

/** Cambia el estado de una grúa (sólo supervisor o sistemas). */
export const cambiarEstadoGrua = async (
  token: string,
  id: string,
  data: { estado: Grua["estado"]; motivo?: string },
) => {
  const res = await api.put(`/gruas/${id}/estado`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


export const terminarTurno = async (token: string, id: string) => {
  const res = await api.put(
    `/turno_grua/${id}/finalizar`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};
