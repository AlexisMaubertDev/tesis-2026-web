import api from "../../../services/api";
import type { NuevaSucursalForm } from "../types/sucursalForm";

export const obtenerSucursales = async (token: string) => {
  const res = await api.get("/sucursales", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const crearSucursal = async (
  token: string,
  sucursalData: NuevaSucursalForm,
) => {
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
  const res = await api.put(`/sucursales/${sucursalData.id}`, sucursalData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
