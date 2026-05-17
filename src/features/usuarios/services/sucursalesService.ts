import api from "../../../services/api";

export const obtenerSucursales = async (token: string) => {
  const res = await api.get("/sucursales", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
