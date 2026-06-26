import api from "../../../services/api";

export const obtenerVehiculos = async (token: string) => {
  const res = await api.get("/vehiculos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
