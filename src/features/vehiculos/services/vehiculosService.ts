import api from "../../../services/api";
import type { Vehiculo } from "../../../types/Vehiculo";

export const obtenerVehiculos = async (token: string) => {
  const res = await api.get("/vehiculos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const editarVehiculo = async (
  token: string,
  id: string,
  vehiculo: Partial<Omit<Vehiculo, "id">>,
) => {
  const res = await api.put(`/vehiculos/${id}`, vehiculo, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const eliminarVehiculo = async (token: string, id: string) => {
  const res = await api.delete(`/vehiculos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const obtenerAcarreosPorPatente = async (
  token: string,
  patente: string,
) => {
  const res = await api.get(`/acarreos/patente/${encodeURIComponent(patente)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
