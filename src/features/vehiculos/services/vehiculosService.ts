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

/**
 * Ingreso a playa desde la barrera: el acarreo ACARREADO pasa a INGRESADO.
 * La usa el home del playero.
 */
export const ingresarAcarreoAPlaya = async (token: string, acarreoId: string) => {
  const res = await api.put(
    `/acarreos/${acarreoId}/ingresar`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

/**
 * Salida de playa desde la barrera: el acarreo COBRADO (abonado) pasa a
 * EGRESADO. La usa el home del playero.
 */
export const egresarAcarreo = async (token: string, acarreoId: string) => {
  const res = await api.put(
    `/acarreos/${acarreoId}/egresar`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};
