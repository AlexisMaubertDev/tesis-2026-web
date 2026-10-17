import api from "../../../services/api";
import type { CajaForm } from "../components/CajaModal";

export const obtenerCajas = async (token: string) => {
  const res = await api.get("/cajas", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const obtenerCajasSucursal = async (token: string, id: string) => {
  const res = await api.get(`/cajas/sucursal/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const crearCaja = async (token: string, data: CajaForm) => {
  const res = await api.post("/cajas", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const editarCaja = async (
  token: string,
  data: CajaForm & { id: string },
) => {
  const res = await api.put(`/cajas/${data.id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
