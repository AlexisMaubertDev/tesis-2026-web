import api from "../../../services/api";
import { exigirConexion } from "../../../app/offline/writes";
import { obtenerConCache } from "../../../app/offline/cache";
import type { CajaForm } from "../components/CajaModal";

export const obtenerCajas = async (token: string) => {
  return obtenerConCache({
    key: "cajas",
    fetcher: async () => {
      const res = await api.get("/cajas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
  });
};

export const obtenerCajasSucursal = async (token: string, id: string) => {
  return obtenerConCache({
    key: `cajas:sucursal:${id}`,
    fetcher: async () => {
      const res = await api.get(`/cajas/sucursal/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
  });
};

export const crearCaja = async (token: string, data: CajaForm) => {
  exigirConexion("el alta de la caja");
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
  exigirConexion("la edición de la caja");
  const res = await api.put(`/cajas/${data.id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
