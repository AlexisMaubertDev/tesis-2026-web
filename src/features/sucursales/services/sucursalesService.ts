import api from "../../../services/api";
import { exigirConexion } from "../../../app/offline/writes";
import { obtenerConCache } from "../../../app/offline/cache";
import type { NuevaSucursalForm } from "../types/sucursalForm";

export const obtenerSucursales = async (token: string) => {
  return obtenerConCache({
    key: "sucursales",
    fetcher: async () => {
      const res = await api.get("/sucursales", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
  });
};

export const obtenerSucursal = async (token: string, id: string) => {
  return obtenerConCache({
    key: `sucursales:${id}`,
    fetcher: async () => {
      const res = await api.get(`/sucursales/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
  });
};

export const crearSucursal = async (
  token: string,
  sucursalData: NuevaSucursalForm,
) => {
  exigirConexion("el alta de la sucursal");
  const res = await api.post("/sucursales", sucursalData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const editarSucursal = async (
  token: string,
  sucursalData: NuevaSucursalForm,
) => {
  exigirConexion("la edición de la sucursal");
  const res = await api.put(`/sucursales/${sucursalData.id}`, sucursalData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
